import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import WindiCSS from 'vite-plugin-windicss';
//import path from 'path';
import dotenv from 'dotenv';
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
			plugins: [WindiCSS()],
			resolve: {}
		}
	}
};

/*
if (process.env.VITE_NODE_ENV !== 'development') {
	config.kit.vite.resolve = {
		alias: {
			'@balleranalytics/nba-api-ts': path.resolve('../packages/nba-api-ts/src')
		}
	};
}
*/

export default config;
