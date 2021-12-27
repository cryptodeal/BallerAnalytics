import dotenv from 'dotenv';

// Parsing the env file.
dotenv.config();

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
	MONGO_PORT: number | undefined;
	MONGO_HOST: string | undefined;
	MONGO_DB: string | undefined;
	MONGO_URI: string | undefined;
	MONGO_CLUSTER_CERT: string | undefined;
	MONGO_DIGITALOCEAN_URI: string | undefined;
	VITE_NODE_ENV: string | undefined;
	S3_ACCESS_KEY: string | undefined;
	S3_SECRET: string | undefined;
	S3_BUCKET: string | undefined;
}

interface Config {
	MONGO_PORT: number;
	MONGO_HOST: string;
	MONGO_DB: string;
	MONGO_URI: string;
	MONGO_CLUSTER_CERT: string;
	MONGO_DIGITALOCEAN_URI: string;
	VITE_NODE_ENV: string;
	S3_ACCESS_KEY: string;
	S3_SECRET: string;
	S3_BUCKET: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
	return {
		MONGO_PORT: process.env.MONGO_PORT ? Number(process.env.MONGO_PORT) : undefined,
		MONGO_HOST: process.env.MONGO_HOST,
		MONGO_DB: process.env.MONGO_DB,
		MONGO_URI: process.env.MONGO_URI,
		MONGO_CLUSTER_CERT: process.env.MONGO_CLUSTER_CERT,
		MONGO_DIGITALOCEAN_URI: process.env.MONGO_DIGITALOCEAN_URI,
		VITE_NODE_ENV: process.env.VITE_NODE_ENV,
		S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
		S3_SECRET: process.env.S3_SECRET,
		S3_BUCKET: process.env.S3_BUCKET
	};
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
	for (const [key, value] of Object.entries(config)) {
		if (value === undefined) {
			throw new Error(`Missing key ${key} in config.env`);
		}
	}
	return config as Config;
};

const config = getConfig();

const verifiedConfig = getSanitzedConfig(config);

export default verifiedConfig;
