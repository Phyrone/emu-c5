import { z } from 'zod';
import {
	RequestErrorNotPermitted,
	RequestErrorUnathorized,
	RequstErrorWrongSchemaBody
} from '$lib/schemas/api_error';

export const CreatePostRequest = z.object({
	title: z.string().min(1).max(255)
});

export type CreatePostRequest = z.infer<typeof CreatePostRequest>;

export const CreatePostResponseCreated = z.object({
	success: z.literal(true),
	postId: z.string()
});

export const CreatePostResponse = z.union([
	CreatePostResponseCreated,
	RequestErrorUnathorized,
	RequestErrorNotPermitted,
	RequstErrorWrongSchemaBody
]);

export const ContentType = z.enum(['short_message', 'post', 'image', 'video', 'short']);

export const GetPostsSearchParams = z.object({
	page: z.number({ coerce: true }).int().min(1).default(1).catch(1),
	limit: z.number({ coerce: true }).int().min(1).max(128).default(32).catch(32),

	not_before: z.string().datetime().optional().catch(undefined),
	not_after: z.string().datetime().optional().catch(undefined),
	author: z.string().optional().catch(undefined),
	types: z
		.array(ContentType.or(z.tuple([ContentType, z.boolean()])))
		.optional()
		.catch(undefined)
});
export type GetPostsSearchParams = z.infer<typeof GetPostsSearchParams>;
