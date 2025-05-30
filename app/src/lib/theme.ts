import type { Handle } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { persisted } from 'svelte-persisted-store';
import { cookie_store } from '$lib/cookie_store';
import themes from 'daisyui/theme/object';

export const THEME_COOKIE_NAME = 'selected-theme';
const THEME_CHANGE_BROADCAST_NAME = 'theme_change';
const THEME_DATA_ATTRIBUTE = 'data-theme';

export const DEFAULT_THEME = 'default';
export const available_themes = [DEFAULT_THEME, ...Object.keys(themes)].toSorted();

export const theme_store = cookie_store<string>(THEME_COOKIE_NAME, 'default', {
	codec: 'plain'
});

if (browser) {
	theme_store.subscribe((theme) => {
		if (!available_themes.includes(theme)) {
			console.warn(`Invalid theme ID: ${theme}. Defaulting to 'default'.`);
			theme_store.set('default');
			theme = 'default';
		}
		let html_element = document.querySelector('html');

		if (theme === 'default') {
			html_element?.removeAttribute(THEME_DATA_ATTRIBUTE);
		} else {
			html_element?.setAttribute(THEME_DATA_ATTRIBUTE, theme);
		}
	});
}
