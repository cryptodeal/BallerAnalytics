declare namespace NodeJS {
	interface ProcessEnv {
		MONGO_PORT: string;
		MONGO_HOST: string;
		MONGO_DB: string;
    MONGO_URI: string;
	}
}

interface BirthLocale {
  city: string;
  country: string;
  state?: string;
}
