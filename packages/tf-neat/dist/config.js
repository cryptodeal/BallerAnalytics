import dotenv from 'dotenv';
// Parsing the env file.
dotenv.config();
// Loading process.env as ENV interface
const getConfig = () => {
    return {
        MONGO_PORT: process.env.MONGO_PORT ? Number(process.env.MONGO_PORT) : undefined,
        MONGO_HOST: process.env.MONGO_HOST,
        MONGO_DB: process.env.MONGO_DB,
        MONGO_URI: process.env.MONGO_URI,
        MONGO_CLUSTER_CERT: process.env.MONGO_CLUSTER_CERT,
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
const getSanitzedConfig = (config) => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in config.env`);
        }
    }
    return config;
};
const config = getConfig();
const verifiedConfig = getSanitzedConfig(config);
export default verifiedConfig;
