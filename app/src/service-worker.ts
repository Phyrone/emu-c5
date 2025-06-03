/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import {ServiceWorkerInstruction} from "./lib/sw-msg";

const sw = self as unknown as ServiceWorkerGlobalScope;
import { build, files, version, prerendered } from '$service-worker';

const CACHE_PREFIX = 'pwa-cache-v';
const CACHE_NAME = `${CACHE_PREFIX}${version}`;

const FILES = ['index.html', ...files, ...build, ...prerendered];

sw.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(install());
});
const cachePromise = caches.open(CACHE_NAME);

async function install() {
	const TIME_KEY = '[ServiceWorker] Installing';
	console.time(TIME_KEY);
	try {
		const cache = await cachePromise;
		await cache.addAll(FILES.map((file) => new Request(new URL(file, location.href))));
	} finally {
		console.timeEnd(TIME_KEY);
	}
}

sw.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(activate());
});

async function activate() {
	const TIME_KEY = '[ServiceWorker] Activating';
	console.time(TIME_KEY);
	try {
		const cacheNames = await caches.keys();
		const oldCaches = cacheNames.filter(
			(name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME
		);
		await Promise.all(oldCaches.map((name) => caches.delete(name)));
	} finally {
		console.timeEnd(TIME_KEY);
	}
}

sw.addEventListener('fetch', (event: FetchEvent) => {
	let requestUrl = new URL(event.request.url);
	if (event.request.method === 'GET' && requestUrl.origin === location.origin) {
		if (FILES.includes(requestUrl.pathname)) {
			event.respondWith(offline_first_assets(event));
		}
	}
});

async function offline_first_assets(event: FetchEvent): Promise<Response> {
	const cache = await cachePromise;
	const response = await cache.match(event.request);
	if (response.ok) {
		return response;
	} else {
		return fetch(event.request);
	}
}
sw.addEventListener('message', (event: ExtendableMessageEvent) => {
	let instruction = ServiceWorkerInstruction.parse(event.data);

	if(instruction.type === 'SKIP_WAITING'){
		event.waitUntil(sw.skipWaiting())
	}

});
console.log('[ServiceWorker] Initialized 1');
