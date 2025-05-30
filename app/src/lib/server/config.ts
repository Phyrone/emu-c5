import 'dotenv/config';
import { parseEnv } from 'znv';
import { z } from 'zod';
//import { env } from '$env/dynamic/private';
import * as static_env from '$env/static/private';
import { lazy } from '$lib/utils';

export const CONFIG = lazy(async () => {
	let env = await import('$env/dynamic/private').then((m) => m.env).catch(() => ({}));
	return parseEnv(
		{
			...static_env,
			...env,
			...(process?.env ?? {})
		},
		{
			DATABASE_URL: {
				schema: z.string().url(),
				description: 'Database URL to the primary postgres database (read-write)'
			},
			DATABASE_REPLICA_URL: {
				schema: z.string().optional(),
				description: 'Database URL to the replica postgres database (read-only)'
			},
			AUTH_KV_URL: z.string().url().optional(),
			AUTH_KV_PREFIX: z.string().optional(),
			AUTH_ALLOW_PASSWORD: z.boolean().default(false),
			AUTH_ALLOW_SIGNUP: z.boolean().default(true),
			FEDIFY_KV_URL: z.string().url().optional(),
			FEDIFY_KV_PREFIX: z.string().optional(),

			DEBUG_SQL: z.boolean().default(false),

			S3_ENDPOINT: z.string().default('s3.amazonaws.com'),
			S3_PORT: z.number({ coerce: true }).optional(),
			S3_BUCKET: z.string(),
			S3_ACCESS_KEY_ID: z.string(),
			S3_SECRET_ACCESS_KEY: z.string(),
			S3_REGION: z.string(),
			S3_USE_SSL: z.boolean().default(true),
			S3_FORCE_PATH_STYLE: z.boolean().optional(),
			S3_CREATE_BUCKET_IF_NOT_EXISTS: z.boolean().default(true),

			GRAPHQL_ENABLED: z.boolean().default(false),

			GRPC_SNOWFLAKE_ADDRESS: z.string()
		}
	);
});
