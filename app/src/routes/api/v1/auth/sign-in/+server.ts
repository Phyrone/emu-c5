import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { apiWrapper, parseRequestBody, responDocument } from '$server/api';
import { z } from 'zod';
import { SignInRequest } from '$lib/schemas/auth';

export const POST: RequestHandler = apiWrapper(async ({ request }) => {
	let [email, password, remember_me] = await parseRequestBody(request, SignInRequest);

	return responDocument(request, [email, password, remember_me]);
});
