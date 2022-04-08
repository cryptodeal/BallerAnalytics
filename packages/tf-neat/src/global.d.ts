declare namespace NodeJS {
	interface ProcessEnv {
		MONGO_PORT: string;
		MONGO_HOST: string;
		MONGO_DB: string;
    MONGO_URI: string;
    VITE_NODE_ENV: string;
	}
}

interface BirthLocale {
  city: string;
  country: string;
  state?: string;
}
