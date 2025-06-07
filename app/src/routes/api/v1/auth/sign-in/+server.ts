import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import {apiWrapper, parseRequestBody, responDocument} from '$server/api';
import { z } from 'zod';

export const POST: RequestHandler = apiWrapper( async ({ request }) => {
	let body = await parseRequestBody(request, z.object({}));

	return responDocument(request,{
		hello: 'world',
	})
});
