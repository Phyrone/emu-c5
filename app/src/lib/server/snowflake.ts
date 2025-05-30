import grpc from '@grpc/grpc-js';
import { CONFIG } from '$server/config';
import { wrapGrpcClient } from './grpc';
import { SnowflakeServiceClientImpl } from '$lib/grpc/snowflake';
import { lazy } from '$lib/utils';

const GRPC_CLIENT = lazy(
	async () =>
		new grpc.Client((await CONFIG()).GRPC_SNOWFLAKE_ADDRESS, grpc.credentials.createInsecure())
);
const GRPC_CLIENT_CHANNEL = lazy(async () => wrapGrpcClient(await GRPC_CLIENT()));
const SNOWFLAKE_SERVICE = lazy(
	async () => new SnowflakeServiceClientImpl(await GRPC_CLIENT_CHANNEL())
);

/**
 * Gets a single snowflake ID
 */
export function snowflake(): Promise<BigInt>;
/**
 * Gets one or multiple snowflake IDs
 * @param count The number of IDs to generate (clamped to a minimum of 1)
 */
export function snowflake(count: number): Promise<Array<BigInt>>;
/**
 * Implementation of the snowflake function
 */
export async function snowflake(count?: number): Promise<BigInt | Array<BigInt>> {
	const { ids } = await SNOWFLAKE_SERVICE().then((service) =>
		service.SnowflakeID({
			count: Math.max(1, count ?? 1)
		})
	);
	if (count === undefined || count === null) {
		return ids[0];
	}
	return ids;
}
