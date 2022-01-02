import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'unplugin-icons/vite';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess(), mdsvex(mdsvexConfig)],

	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: {
			ssr: {
				external: ['mongoose-slugger-plugin']
			},
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

if (
	process.env.VITE_NODE_ENV === 'VercelDevelopment' ||
	process.env.VITE_NODE_ENV === 'development'
) {
	config.kit.vite.resolve = {
		alias: {
			'@balleranalytics/nba-api-ts': path.resolve('../packages/nba-api-ts/src')
		}
	};
}

export default config;
