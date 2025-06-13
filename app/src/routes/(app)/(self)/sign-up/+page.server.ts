import type { Actions } from '@sveltejs/kit';

export const actions = {
	'sign-in': async ({ request, locals }) => {
		return {
			hello: 'world'
		};
	}
} satisfies Actions;
