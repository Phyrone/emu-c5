import 'zod-openapi/extend';
import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import {
	CreatePostRequest,
	CreatePostResponseCreated,
	GetPostsSearchParams
} from '$lib/schemas/post';
import { RequestErrorUnathorized } from '$lib/schemas/api_error';
import { GetProfilesSearchParams } from '$lib/schemas/profile';

export const apiDocument = createDocument({
	openapi: '3.1.0',
	info: {
		title: 'EMU Api',
		version: '1.0.0'
	},
	paths: {
		'/api/health': {
			get: {
				responses: {
					200: {
						content: {
							'text/plain': {
								schema: z.literal('ok')
							}
						}
					}
				}
			}
		},

		// profiles
		'/api/v1/profiles': {
			get: {
				tags: ['profiles'],
				requestParams: {
					query: GetProfilesSearchParams
				},
				responses: {
					200: {
						content: {
							'application/json': {
								schema: z.object({})
							}
						}
					}
				}
			}
		},

		// channels
		'/api/v1/channels': {
			get: {
				tags: ['channels'],
				responses: {
					200: {
						content: {
							'application/json': {
								schema: z.object({})
							}
						}
					}
				}
			}
		},
		// posts
		'/api/v1/posts': {
			get: {
				tags: ['posts'],
				requestParams: {
					query: GetPostsSearchParams
				},
				responses: {
					200: {
						content: {
							'application/json': {
								schema: z.object({
									params: z.object({
										page: z.number()
									})
								})
							}
						}
					}
				}
			},
			post: {
				tags: ['posts'],
				requestBody: {
					content: {
						'application/json': {
							schema: CreatePostRequest
						}
					}
				},
				responses: {
					201: {
						content: {
							'application/json': {
								schema: CreatePostResponseCreated
							}
						}
					},
					401: {
						content: {
							'application/problem+json': {
								schema: RequestErrorUnathorized
							}
						}
					}
				}
			}
		},
		'/api/v1/posts/{postId}': {
			get: {
				tags: ['posts'],
				requestParams: {
					path: z.object({
						postId: z.string().nanoid()
					}),
					query: GetPostsSearchParams
				},
				responses: {
					200: {
						content: {
							'application/json': {
								schema: z.object({
									params: z.object({
										page: z.number()
									})
								})
							}
						}
					}
				}
			}
		}
	}
});
