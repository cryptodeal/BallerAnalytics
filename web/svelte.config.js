import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'unplugin-icons/vite';
import ObjFileImport from 'unplugin-obj/vite';
import MtlFileImport from 'unplugin-mtl/vite';

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
		adapter: adapter({ external: ['@napi-rs/*'] }),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		vite: {
			plugins: [
				WindiCSS(),
				Icons({
					compiler: 'svelte'
				}),
				ObjFileImport(),
				MtlFileImport()
			],
			ssr: {
				noExternal: ['three']
			},
			resolve: {
				dedupe: ['mongoose']
			}
		}
	}
};

if (process.env.VITE_NODE_ENV === 'VercelDevelopment') {
	config.kit.vite.resolve.alias = {
		'@balleranalytics/nba-api-ts': path.resolve('../packages/nba-api-ts/src'),
		$models: path.resolve('src/models')
	};
} else {
	config.kit.vite.resolve.alias = {
		'@balleranalytics/nba-api-ts': path.resolve('../packages/nba-api-ts/sr'),
		$models: path.resolve('src/models')
	};
}

export default config;
