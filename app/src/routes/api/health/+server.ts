import type { RequestHandler } from './$types';
import { text } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	return text('ok', {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
};
