import mongoose from "mongoose";

declare namespace NodeJS {
	interface ProcessEnv {
		MONGO_PORT: string;
		MONGO_HOST: string;
    MONGO_DB: string;
	}
}

type CachedMongoose = {
  conn: null | typeof mongoose;
    promise: null | Promise<typeof mongoose>;
}