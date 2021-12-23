import mongoose from 'mongoose';
import config from '../config';
//import { writeFileSync } from 'fs';
//import path from 'path';
import { cwd } from 'process';

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
	tlsCertificateKeyFile?: string;
	sslValidate?: boolean;
	tlsInsecure?: boolean;
	tls?: boolean;
	user?: string;
	pass?: string;
	dbName: string;
}

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function serverlessConnect(mongooseURI: string): Promise<typeof mongoose> {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts: MONGO_OPTS = {
			dbName: config.MONGO_DB,
			useNewUrlParser: true,
			useUnifiedTopology: true
		};

		// For testing purposes
		// if (config.VITE_NODE_ENV === 'development') {
		if (config.VITE_NODE_ENV === 'VercelDevelopment') {
			//const certFile = Buffer.from(config.MONGO_CLUSTER_CERT, 'base64');
			//writeFileSync(digitalOceanCert, certFile);
			// console.log(`${cwd()}/ca-certificate.cer`);
			opts.tlsCAFile = `${cwd()}/ca-certificate.cer`;
		}

		cached.promise = mongoose.connect(mongooseURI, opts).then((mongoose) => {
			return mongoose;
		});
	}
	cached.conn = await cached.promise;
	return cached.conn;
}

export { serverlessConnect };
