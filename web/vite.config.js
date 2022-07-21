import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import ObjFileImport from 'unplugin-obj/vite';
import MtlFileImport from 'unplugin-mtl/vite';

/** @type {import('vite').UserConfig} */
const config = defineConfig({
	ssr: {
		noExternal: [
			'three',
			'three/examples/jsm/loaders/GLTFLoader.js',
			'three/examples/jsm/loaders/KTX2Loader.js'
		]
	},
	plugins: [
		sveltekit(),
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
	}
});

export default config;
