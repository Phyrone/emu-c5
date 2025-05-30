import 'zod-openapi/extend';
import { z } from 'zod';

/**
 * A document describing a problem details following the RFC 7807 and RFC 9457 specifications.
 */
export const ProblemDetails = z
	.object({
		type: z.string().url().openapi({}),
		status: z.number().int().min(100).max(599),
		title: z.string(),
		detail: z.string().optional(),
		instance: z.string().url().optional()
	})
	.openapi({
		title: 'Problem Details',
		description:
			'A document describing a problem details following the RFC 7807 and RFC 9457 specifications.'
	})
	.passthrough();

export type ProblemDetails = z.infer<typeof ProblemDetails>;

export const ProblemDetailsResponse = ProblemDetails.extend({
	success: z.literal(false)
});

export type ProblemDetailsResponse = z.infer<typeof ProblemDetailsResponse>;
