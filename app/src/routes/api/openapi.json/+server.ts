import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiDocument } from './document';
export const prerender = true;
export const trailingSlash = 'never';

export const GET: RequestHandler = async () => json(apiDocument);
