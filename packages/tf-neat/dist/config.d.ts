interface Config {
    MONGO_PORT: number;
    MONGO_HOST: string;
    MONGO_DB: string;
    MONGO_URI: string;
    MONGO_CLUSTER_CERT: string;
    VITE_NODE_ENV: string;
    S3_ACCESS_KEY: string;
    S3_SECRET: string;
    S3_BUCKET: string;
}
declare const verifiedConfig: Config;
export default verifiedConfig;
