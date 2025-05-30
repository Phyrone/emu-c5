import {
	type Subscriber,
	type Unsubscriber,
	type Updater,
	type Writable,
	writable as inner_writable
} from 'svelte/store';
import Cookies from 'js-cookie';
import superjson from 'superjson';
import type { Persisted } from 'svelte-persisted-store';
import { browser } from '$app/environment';
import { z } from 'zod';

type SyncMessage = {
	name: string;
	value: any;
};
let sync_channel = new BroadcastChannel(`store::cookie`);

export const CookieCodec = z.enum(['plain', 'json', 'superjson']);
export type CookieCodec = z.infer<typeof CookieCodec>;

export type CookieStoreOptions = {
	attributes?: Cookies.CookieAttributes;
	refresh_on_init?: boolean;
	codec?: CookieCodec;
};

/**
 * A svelte store that persists its value in a cookie.
 * @param name - The name of the cookie to store the value in.
 * @param initialValue - The initial value of the store in case the cookie does not exist.
 * @param options - Optional attributes for the cookie, such as `expires`, `path`, `domain`, etc.
 */
export function cookie_store<T>(
	name: string,
	initialValue: T,
	options?: CookieStoreOptions
): Persisted<T> {
	let codec: CookieCodec = options?.codec ?? 'superjson';
	if (!CookieCodec.safeParse(codec).success) {
		throw new Error(`Invalid codec: ${codec}`);
	}

	let initial_cookie = Cookies.get(name);
	let initial_cookie_value: T | undefined = initial_cookie
		? ((codec == 'superjson'
				? superjson.parse(initial_cookie)
				: codec == 'json'
					? JSON.parse(initial_cookie)
					: String(initial_cookie)) as T)
		: undefined;

	let initial = initial_cookie_value ?? initialValue;

	function set_cookie(value: T) {
		if (browser) {
			if (value != initialValue) {
				let value_str: string;
				if (codec == 'superjson') value_str = superjson.stringify(value);
				else if (codec == 'json') value_str = JSON.stringify(value);
				else if (codec == 'plain') value_str = String(value);
				else throw new Error(`Invalid codec: ${codec}`);

				Cookies.set(name, value_str, options?.attributes);
				sync_channel.postMessage({
					name,
					value
				} satisfies SyncMessage);
			} else {
				// If the value is the same as the initial value, we can remove the cookie
				Cookies.remove(name, options?.attributes);
			}
		}
	}

	if (options?.refresh_on_init && initial_cookie_value && browser) {
		set_cookie(initial_cookie_value);
	}

	const store = inner_writable(initial, (set) => {
		const listener = (event: MessageEvent<SyncMessage>) => {
			if (event.data.name === name) {
				set(event.data.value);
			}
		};
		sync_channel.addEventListener('message', listener);

		return () => {
			sync_channel.removeEventListener('message', listener);
		};
	});

	return {
		reset: function (): void {
			if (browser) Cookies.remove(name, options?.attributes);
			store.set(initialValue);
		},
		set: function (this: void, value: T): void {
			set_cookie(value);
			store.set(value);
		},
		update: function (this: void, updater: Updater<T>): void {
			return store.update((value) => {
				let v = updater(value);
				set_cookie(v);
				return v;
			});
		},
		subscribe: store.subscribe
	} satisfies Persisted<T>;
}
