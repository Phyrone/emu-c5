import 'dotenv/config';
import { parseEnv } from 'znv';
import { z } from 'zod';
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
			GRPC_SNOWFLAKE_ADDRESS: z.string()
		}
	);
});
