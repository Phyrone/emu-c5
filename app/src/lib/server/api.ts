import { json, text, type RequestHandler } from '@sveltejs/kit';
import { ProblemDetails, type ProblemDetailsResponse } from '$lib/problem';
import { z, ZodArray, ZodError, type ZodRawShape, ZodTuple } from 'zod';
import type { ZodObject } from 'zod';
import type {
	RequestErrorUnathorized,
	RequestErrorWrontSchemaQuery,
	RequstErrorWrongSchemaBody
} from '$lib/schemas/api_error';
import Negotiator from 'negotiator';
import { decodeAsync as msgpDecodeAsync, encode as msgpEncode } from '@msgpack/msgpack';
import etag from 'etag';

export type ApiWrapperSettings = {
	auth?: {
		required?: boolean;
	};
};

export class ProblemError extends Error {
	constructor(public details: ProblemDetails) {
		super(details.title);
		this.name = 'ProblemError';
		this.cause = details;
	}
}

export function apiWrapper<
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
	RouteId extends string | null = string | null
>(
	inner: RequestHandler<Params, RouteId>,
	settings?: ApiWrapperSettings
): RequestHandler<Params, RouteId> {
	return async (event) => {
		const { locals } = event;
		try {
			if (settings?.auth?.required) {
				//TODO: implement authentication
				throw new Error('authentication is not implemented yet');
			}
			return await inner(event);
		} catch (e) {
			if (e instanceof ProblemError) {
				return returnProblem(e.details);
			}
			const details = ProblemDetails.safeParse(e);
			if (details.success && details.data) {
				return returnProblem(details.data);
			} else {
				console.error('Error while processing request', e);
				throw e;
			}
		}
	};
}

function returnProblem(problem: ProblemDetails): Response {
	return json(
		{
			success: false,
			...(problem as ProblemDetails)
		} satisfies ProblemDetailsResponse,
		{
			status: problem.status,
			statusText: problem.title,
			headers: {
				'Content-Type': 'application/problem+json'
			}
		}
	);
}

export function parseRequestBodyError(error: any): never {
	if (error instanceof ZodError) {
		throw new ProblemError({
			success: false,
			type: 'request:schema:body',
			title: 'Request does not match the expected schema',
			status: 422,
			detail: error.errors.map((e) => e.message).join(', '),
			issues: error.errors
		} as RequstErrorWrongSchemaBody);
	} else {
		throw error;
	}
}

export function parseRequestQueryError(error: any): never {
	if (error instanceof ZodError) {
		throw new ProblemError({
			success: false,
			type: 'request:schema:query',
			title: 'Request does not match the expected schema',
			status: 422,
			detail: error.errors.map((e) => e.message).join(', '),
			issues: error.errors
		} satisfies RequestErrorWrontSchemaQuery);
	} else {
		throw error;
	}
}

export async function parseRequestBody<T extends z.ZodTypeAny>(
	request: Request,
	schema: T
): Promise<z.infer<T>> {
	if (request.body) {
		let media_type = request.headers.get('Content-Type');

		let rawDocument: unknown;
		switch (media_type) {
			case null:
			case 'application/json': {
				rawDocument = await request.json();
				break;
			}
			case 'application/msgpack':
			case 'application/x-msgpack': {
				rawDocument = await msgpDecodeAsync(request.body, {
					useBigInt64: true
				});
				break;
			}
			default: {
				throw new ProblemError({
					success: false,
					type: 'request:unsupported-media-type:request-body',
					title: 'Unsupported Media Type',
					status: 415,
					detail: `The media type "${media_type}" is not supported.`,
					requested: media_type,
					accepts: ['application/json', 'application/msgpack', 'application/x-msgpack']
				});
			}
		}
		return (await schema.parseAsync(rawDocument).catch(parseRequestBodyError)) as Promise<T>;
	} else {
		throw new ProblemError({
			success: false,
			type: 'request:empty-body',
			title: 'Empty request body',
			status: 400,
			detail: 'The request body is empty.'
		});
	}
}

export async function responDocument<T>(
	request: Request,
	data: T,
	options?: ResponseInit
): Promise<Response> {
	const negotiator = new Negotiator({
		headers: Object.fromEntries(request.headers.entries())
	});
	const responseType = negotiator.mediaType([
		'application/json',
		'application/msgpack',
		'application/x-msgpack'
	]);
	switch (responseType) {
		case 'application/json': {
			const json = JSON.stringify(data);

			return new Response(json, {
				...options,
				headers: {
					'Content-Type': responseType,
					'Content-Length': String(Buffer.byteLength(json)),
					ETag: etag(json),
					...options?.headers
				}
			});
		}
		case 'application/msgpack':
		case 'application/x-msgpack': {
			const encoded = msgpEncode(data, {
				useBigInt64: true
			});
			const tag = etag(Buffer.from(encoded));

			return new Response(encoded, {
				...options,
				headers: {
					'Content-Type': responseType,
					'Content-Length': String(encoded.length),
					ETag: tag,
					...options?.headers
				}
			});
		}
		default: {
			throw new ProblemError({
				success: false,
				type: 'response:unsupported-media-type:accepted',
				title: 'Unsupported Media Type',
				status: 406,
				detail: `No acceptable response media type found for the request.`,
				requested: responseType,
				accepts: ['application/json', 'application/msgpack', 'application/x-msgpack']
			});
		}
	}
}
