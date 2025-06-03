import { redirect } from '@sveltejs/kit';

export const prerender = false;
export const ssr = false;

export const load = async ({ fetch }) => {
	redirect(301, '/');
};
