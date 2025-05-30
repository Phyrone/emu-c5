import { ProblemDetailsResponse } from '$lib/problem';
import { z } from 'zod';

export const RequestErrorUnathorized = ProblemDetailsResponse.extend({
	type: z.literal('auth:unauthorized'),
	title: z.literal('missing or invalid session'),
	status: z.literal(401)
}).openapi({
	example: {
		success: false,
		type: 'auth:unauthorized',
		title: 'missing or invalid session',
		status: 401
	}
});

export type RequestErrorUnathorized = z.infer<typeof RequestErrorUnathorized>;
export const RequestErrorNotPermitted = ProblemDetailsResponse.extend({
	type: z.literal('auth:not_permitted'),
	title: z.literal('You are not permitted to perform this action'),
	status: z.literal(403)
});

export type RequestErrorNotPermitted = z.infer<typeof RequestErrorNotPermitted>;

export const RequstErrorWrongSchemaBody = ProblemDetailsResponse.extend({
	type: z.literal('request:schema:body'),
	title: z.literal('Request does not match the expected schema'),

	status: z.literal(422)
});
export type RequstErrorWrongSchemaBody = z.infer<typeof RequstErrorWrongSchemaBody>;

export const RequestErrorWrontSchemaQuery = ProblemDetailsResponse.extend({
	type: z.literal('request:schema:query'),
	title: z.literal('Request does not match the expected schema'),

	status: z.literal(422)
});
export type RequestErrorWrontSchemaQuery = z.infer<typeof RequestErrorWrontSchemaQuery>;
