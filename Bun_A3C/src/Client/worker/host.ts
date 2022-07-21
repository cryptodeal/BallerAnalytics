import { Hono } from 'hono';
import { Worker } from '.';
import { APIResponseStatus } from '../../const';
import { addWorkerToken } from '../utils';
import * as minimist from 'minimist';

const argv = <{ port?: number; p?: number }>minimist(process.argv.slice(2));

let port = 8085;
/* specify port using -p or --port arg */
if (argv.port || argv.p) port = argv.port ? argv.port : argv.p ? argv.p : 8085;
const app = new Hono();

app.get('/start_worker', async (c) => {
	const worker = new Worker(1);
	await addWorkerToken(1);
	await worker.run();
	return c.json({ status: APIResponseStatus.SUCCESS });
});

export default {
	port: port,
	fetch: app.fetch
};
