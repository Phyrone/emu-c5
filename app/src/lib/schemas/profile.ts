import { z } from 'zod';

export const SearchProfilesCategory = z.enum([
	'friends',
	'followers',
	'following',
	'blocked',
	'suggested'
]);

export const GetProfilesSearchParams = z.object({
	page: z.number({ coerce: true }).int().min(1).default(1).catch(1),
	limit: z.number({ coerce: true }).int().min(1).max(128).default(32).catch(32),
	category: SearchProfilesCategory.default('suggested')
});
export type GetProfilesSearchParams = z.infer<typeof GetProfilesSearchParams>;
