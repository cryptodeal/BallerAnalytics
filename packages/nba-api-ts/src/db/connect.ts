import mongoose from 'mongoose';
import config from '../config';
import { writeFile } from 'fs/promises';
import { Buffer } from 'buffer';

export const initConnect = () => {
	const mongooseURI = `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`;
	return mongoose.connect(mongooseURI, {}).then((mongoose) => {
		console.log(`🟢  Mongoose connected`, mongoose.connection.host);
		return mongoose;
	});
};

export const endConnect = () => {
	return mongoose.disconnect().then((mongoose) => {
		console.log('🟡  Mongoose connection closed');
		return mongoose;
	});
};

let cached = global.mongoose;

interface MONGO_OPTS {
	useNewUrlParser?: boolean;
	useUnifiedTopology?: boolean;
	tlsCAFile?: string;
}

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function serverlessConnect(mongooseURI: string): Promise<typeof mongoose> {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const digitalOceanCert = 'ca-certificate.cer';
		const opts: MONGO_OPTS = {};

		if (config.VITE_NODE_ENV === 'VercelDevelopment') {
			const data = Buffer.from(config.MONGO_CLUSTER_CERT);
			await writeFile(digitalOceanCert, data);
			opts.useNewUrlParser = true;
			opts.useUnifiedTopology = true;
			opts.tlsCAFile = digitalOceanCert;
		}

		cached.promise = mongoose.connect(mongooseURI, opts).then((mongoose) => {
			return mongoose;
		});
	}
	cached.conn = await cached.promise;
	return cached.conn;
}

export { serverlessConnect };
