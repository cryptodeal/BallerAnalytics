import mongoose from 'mongoose';
import config from '../config';
import { tmpdir } from 'os';
import { writeFileSync } from 'fs';
//import { Buffer } from 'buffer';

const base64ToBlob = (base64Data: string): Blob => {
	// Split into two parts
	const parts = base64Data.split(';base64,');

	// Hold the content type
	const fileType = parts[0].split(':')[1];

	// Decode Base64 string
	const decodedData = atob(parts[1]);

	// Create UNIT8ARRAY of size same as row data length
	const uInt8Array = new Uint8Array(decodedData.length);

	// Insert all character code into uInt8Array
	for (let i = 0; i < decodedData.length; ++i) {
		uInt8Array[i] = decodedData.charCodeAt(i);
	}

	// Return BLOB image after conversion
	return new Blob([uInt8Array], { type: fileType });
};

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
	ssl?: boolean;
	tlsInsecure?: boolean;
	sslCert?: string;
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
		//if (config.VITE_NODE_ENV === 'development') {
		if (config.VITE_NODE_ENV === 'VercelDevelopment') {
			const certFile = Buffer.from(config.MONGO_CLUSTER_CERT, 'base64');
			//const tlsCAFile = URL.createObjectURL(certFile);
			//opts.sslCA = Buffer.from(config.MONGO_CLUSTER_CERT, 'base64');
			const digitalOceanCert = `${tmpdir()}/ca-certificate.cer`;
			writeFileSync(digitalOceanCert, certFile);
			// console.log(`${cwd()}/ca-certificate.cer`);
			//opts.tlsCAFile = resolve('./ca-certificate.cer');

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
