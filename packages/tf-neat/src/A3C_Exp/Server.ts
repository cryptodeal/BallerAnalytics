import { A3CServer } from './A3CServer';

const server = new A3CServer();

process.on('SIGINT', () => {
	console.log('Caught interrupt signal');
	return server.close().then((val) => {
		console.log('Gracefully shut down uWebsockets.js server:', val);
		process.exit();
	});
});
