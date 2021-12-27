import dotenv from 'dotenv';

// Parsing the env file.
dotenv.config();

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
	MONGO_URI: string | undefined;
	MONGO_DB: string | undefined;
	MONGO_CLUSTER_CERT: string | undefined;
	JWT_SECRET: string | undefined;
	ZOHO_USER: string | undefined;
	ZOHO_PASS: string | undefined;
}

interface Config {
	MONGO_URI: string;
	MONGO_DB: string;
	MONGO_CLUSTER_CERT: string;
	JWT_SECRET: string;
	ZOHO_USER: string;
	ZOHO_PASS: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
	return {
		MONGO_URI: process.env.MONGO_URI,
		MONGO_DB: process.env.MONGO_DB,
		MONGO_CLUSTER_CERT: process.env.MONGO_CLUSTER_CERT,
		JWT_SECRET: process.env.JWT_SECRET,
		ZOHO_USER: process.env.ZOHO_USER,
		ZOHO_PASS: process.env.ZOHO_PASS
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
