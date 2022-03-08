/// <reference types="@sveltejs/kit" />
/// <reference types="unplugin-icons/types/svelte" />

declare module '*.svelte' {
	export { SvelteComponentDev as default } from 'svelte/internal';
	export const version: string;
	// ... other stuff
}

declare namespace NodeJS {
	interface ProcessEnv {
		MONGO_URI: string;
		MONGO_DB: string;
		MONGO_CLUSTER_CERT: string;
		JWT_SECRET: string;
		ZOHO_USER: string;
		ZOHO_PASS: string;
	}
}

interface ImportMetaEnv {
	readonly VITE_JWT_EXPIRY: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
