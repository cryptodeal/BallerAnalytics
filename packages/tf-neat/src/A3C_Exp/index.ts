import { A3CServer } from './Server';
import { execute } from './utils';

const server = new A3CServer();
execute(`newsh "npm run host:worker"`);

process.on('SIGINT', () => {
	console.log('Caught interrupt signal');
	return server.close().then((val) => {
		console.log('Gracefully shut down uWebsockets.js server:', val);
		process.exit();
	});
});
