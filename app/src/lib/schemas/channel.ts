import { z } from 'zod';

export const GetChannelsSearchParams = z.object({
	page: z.number({ coerce: true }).int().min(1).default(1).catch(1),
	limit: z.number({ coerce: true }).int().min(1).max(128).default(32).catch(32)
});
export type GetChannelsSearchParams = z.infer<typeof GetChannelsSearchParams>;
