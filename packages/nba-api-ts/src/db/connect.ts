import mongoose from 'mongoose';
import config from '../config';
import { tmpdir } from 'os';
import { writeFileSync } from 'fs';
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
const mongooseURI = `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`;
const digitalOceanCert = `${tmpdir()}/ca-certificate.cer`;
const opts: mongoose.ConnectOptions = {
	dbName: config.MONGO_DB
};

mongoose.connection.on('error', (err) => {
	console.log(err);
});

export const initConnect = (prod = false) => {
	if (prod === true) {
		writeFileSync(digitalOceanCert, Buffer.from(config.MONGO_CLUSTER_CERT, 'base64'));
		opts.tlsCAFile = digitalOceanCert;
		opts.bufferCommands = false;
	}
	const usedURI = prod ? config.MONGO_URI : mongooseURI;
	return mongoose
		.connect(usedURI, opts)
		.then((mongoose) => {
			console.log(`🟢  Mongoose connected`, mongoose.connection.host);
			return mongoose;
		})
		.catch((err) => console.log(err));
};

export const endConnect = () => {
	return mongoose.disconnect().then((mongoose) => {
		console.log('🟡  Mongoose connection closed');
		return mongoose;
	});
};

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

export async function serverlessConnect(mongooseURI: string): Promise<typeof mongoose> {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		writeFileSync(digitalOceanCert, Buffer.from(config.MONGO_CLUSTER_CERT, 'base64'));
		opts.tlsCAFile = digitalOceanCert;

		cached.promise = mongoose.connect(mongooseURI, opts).then((mongoose) => {
			return mongoose;
		});
	}
	cached.conn = await cached.promise;
	return cached.conn;
}
