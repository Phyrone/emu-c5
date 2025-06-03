import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import icon_maskable from '$assets/icon512_maskable.png?url';
import icon_rounded from '$assets/icon512_rounded.png?url';

export const prerender = true;

const PwaManifest = z.object({
	theme_color: z.string().optional(),
	background_color: z.string().optional(),
	orientation: z.enum(['portrait', 'landscape', 'natural']).optional(),
	display: z.enum(['standalone', 'fullscreen', 'minimal-ui', 'browser']).optional(),
	dir: z.enum(['ltr', 'rtl', 'auto']).optional(),
	lang: z.string().optional(),
	name: z.string().optional(),
	short_name: z.string().optional(),
	icons: z
		.array(
			z.object({
				src: z.string(),
				sizes: z.string(),
				type: z.string(),
				purpose: z.string().optional()
			})
		)
		.optional(),
	start_url: z.string().url(),
	scope: z.string().optional(),
	description: z.string().optional(),
	categories: z.array(z.string()).optional(),
	screenshots: z
		.array(
			z.object({
				src: z.string(),
				sizes: z.string(),
				type: z.string()
			})
		)
		.optional(),
	related_applications: z
		.array(
			z.object({
				platform: z.string(),
				url: z.string(),
				id: z.string().optional()
			})
		)
		.optional(),
	prefer_related_applications: z.boolean().optional(),
	shortcuts: z
		.array(
			z.object({
				name: z.string(),
				short_name: z.string().optional(),
				description: z.string().optional(),
				url: z.string(),
				icons: z
					.array(
						z.object({
							src: z.string(),
							sizes: z.string(),
							type: z.string()
						})
					)
					.optional()
			})
		)
		.optional(),
	display_override: z.array(z.string()).optional(),
	theme_color_dark: z.string().optional(),
	background_color_dark: z.string().optional(),
	iarc_rating_id: z.string().optional(),
	dir_short: z.string().optional()
});

type PwaManifest = z.infer<typeof PwaManifest>;

export const GET: RequestHandler = async ({ url }) => {
	return json({
		orientation: 'natural',
		display: 'standalone',
		dir: 'auto',
		lang: 'de-DE',
		name: 'EMU',
		short_name: 'EMU',
		theme_color: '#8936FF',
		background_color: '#2EC6FE',
		start_url: '/',
		icons: [
			{
				purpose: 'maskable',
				sizes: '512x512',
				//"src": "icon512_maskable.png",
				src: icon_maskable,
				type: 'image/png'
			},
			{
				purpose: 'any',
				sizes: '512x512',
				//"src": "icon512_rounded.png",
				src: icon_rounded,
				type: 'image/png'
			}
		]
	} satisfies PwaManifest);
};
