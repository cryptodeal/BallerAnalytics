import { A3CServer } from './A3CServer';
import { execute, spawn_worker_count } from './utils';

const server = new A3CServer();
for (let i = 0; i < spawn_worker_count; i++) {
	execute(`newsh "npm run host:worker"`);
}

process.on('SIGINT', () => {
	console.log('Caught interrupt signal');
	return server.close().then((val) => {
		console.log('Gracefully shut down uWebsockets.js server:', val);
		process.exit();
	});
});
