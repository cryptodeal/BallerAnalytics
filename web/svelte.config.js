import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'unplugin-icons/vite';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess(), mdsvex(mdsvexConfig)],

	kit: {
		adapter: adapter({
			esbuild(defaultOptions) {
				return {
					...defaultOptions,
					plugins: [],
					external: ['@napi-rs/*']
				};
			}
		}),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: {
			plugins: [
				WindiCSS(),
				Icons({
					compiler: 'svelte'
				})
			],
			resolve: {}
		}
	}
};

if (process.env.VITE_NODE_ENV === 'VercelDevelopment') {
	config.kit.vite.resolve = {
		alias: {
			'@balleranalytics/nba-api-ts': path.resolve('../packages/nba-api-ts/src')
		}
	};
}

export default config;
