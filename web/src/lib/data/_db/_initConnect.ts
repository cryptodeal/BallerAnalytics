import { mongoose } from '@balleranalytics/nba-api-ts';
import config from '$lib/_config';

let cached = global.mongoose;

interface MONGO_OPTS {
	useNewUrlParser?: boolean;
	useUnifiedTopology?: boolean;
	tlsCAFile?: string;
	tlsCertificateKeyFile?: string;
	sslValidate?: boolean;
	ssl?: boolean;
	tlsInsecure?: boolean;
	sslCert?: string;
	dbName: string;
}

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

export async function serverlessConnect(mongooseURI: string): Promise<typeof mongoose> {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts: MONGO_OPTS = {
			dbName: config.MONGO_DB,
			useNewUrlParser: true
		};

		cached.promise = mongoose.connect(mongooseURI, opts).then((mongoose) => {
			return mongoose;
		});
	}
	cached.conn = await cached.promise;
	return cached.conn;
}