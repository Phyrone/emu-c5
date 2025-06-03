import adapter_node from '@sveltejs/adapter-node';
import adapter_static from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { parseEnv } from 'znv';
import { z } from 'zod';

const { BUILD_TARGET, BUILD_PRECOMPRESS } = parseEnv(process.env, {
	BUILD_TARGET: z.enum(['node', 'spa']).default('node'),
	BUILD_PRECOMPRESS: z.boolean().default(true)
});

function getAdapter() {
	switch (BUILD_TARGET) {
		case 'node':
			return adapter_node({
				out: 'build',
				precompress: BUILD_PRECOMPRESS
			});
		case 'spa':
			return adapter_static({
				assets: 'build',
				pages: 'build',
				fallback: 'index.html',
				precompress: BUILD_PRECOMPRESS,
				strict: false
			});
	}
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: getAdapter(),
		alias: {
			$lib: './src/lib',
			$server: './src/lib/server',
			$assets: './src/assets',
			$styles: './src/styles'
		},
		inlineStyleThreshold: 512,
		paths: {
			relative: false
		},
		serviceWorker: {
			register: false
		}
	}
};

export default config;
