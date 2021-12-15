/// <reference types="@sveltejs/kit" />
/// <reference types="vite/client" />

declare namespace NodeJS {
	interface ProcessEnv {
		MONGO_PORT: string;
		MONGO_HOST: string;
		MONGO_DB: string;
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
