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
		adapter: adapter({ external: ['@napi-rs*', '@napi-rs/*', '@napi-rs/pinyin-darwin-arm64'] }),
		vite: {
			plugins: [
				WindiCSS(),
				Icons({
					compiler: 'svelte'
				}),
				ObjFileImport(),
				MtlFileImport()
			],
			build: {
				rollupOptions: {
					inlineDynamicImports: false,
					manualChunks: {
						GLTFLoader: ['three/examples/jsm/loaders/GLTFLoader.js'],
						KTX2Loader: ['three/examples/jsm/loaders/KTX2Loader.js']
					}
				}
			},
			resolve: {
				dedupe: ['mongoose', 'dayjs']
			}
		}
	}
};

if (process.env.VITE_NODE_ENV === 'VercelDevelopment') {
	config.kit.vite.resolve.alias = {
		'@balleranalytics/nba-api-ts': path.resolve('../packages/nba-api-ts/dist'),
		'@balleranalytics/tf-neat': path.resolve('../packages/tf-neat/dist'),
		$models: path.resolve('src/models'),
		$ml: path.resolve('src/ml')
	};
} else {
	config.kit.vite.resolve.alias = {
		'@balleranalytics/nba-api-ts': path.resolve('../packages/nba-api-ts/dist'),
		'@balleranalytics/tf-neat': path.resolve('../packages/tf-neat/dist'),
		$models: path.resolve('src/models'),
		$ml: path.resolve('src/ml')
	};
}

export default config;
