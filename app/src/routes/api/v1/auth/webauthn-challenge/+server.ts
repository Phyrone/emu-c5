import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { apiWrapper, parseRequestBody, responDocument } from '$server/api';
import { z } from 'zod';
import { SignInRequest } from '$lib/schemas/auth';

export const GET: RequestHandler = apiWrapper(async ({ request }) => {
	return responDocument(request, ['test']);
});
