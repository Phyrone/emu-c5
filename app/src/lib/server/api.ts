import { json, type RequestHandler } from '@sveltejs/kit';
import { ProblemDetails, type ProblemDetailsResponse } from '$lib/problem';
import { ZodError } from 'zod';
import type {
	RequestErrorUnathorized,
	RequestErrorWrontSchemaQuery,
	RequstErrorWrongSchemaBody
} from '$lib/schemas/api_error';

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
			if (e instanceof ZodError) {
				return returnProblem(wrongSchemaProblem(e));
			}
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

function wrongSchemaProblem(error: ZodError): RequstErrorWrongSchemaBody {
	return {
		success: false,
		type: 'request:schema:body',
		title: 'Request does not match the expected schema',
		status: 422,
		detail: error.errors.map((e) => e.message).join(', '),
		issues: error.errors
	} as RequstErrorWrongSchemaBody;
}

export function parseRequstError(error: any) {
	if (error instanceof ZodError) {
		throw new ProblemError(wrongSchemaProblem(error));
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
