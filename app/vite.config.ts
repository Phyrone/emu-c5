import {paraglideVitePlugin} from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit(),
        paraglideVitePlugin({
            project: './project.inlang',
            outdir: './src/lib/paraglide',
            strategy: ['url', 'cookie', 'baseLocale']
        }),
        mkcert({autoUpgrade: true,})
    ],
    server: {
        https: {
            minVersion: 'TLSv1.2',
        },

    },
    build: {
        minify: 'terser',
        cssMinify: 'lightningcss',
        cssCodeSplit: true,
        reportCompressedSize: true
    }
});
