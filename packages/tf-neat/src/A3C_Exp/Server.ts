import * as HyperExpress from 'hyper-express';
import { appendFile, readFile, writeFile } from 'fs/promises';
import { createReadStream, open, close } from 'fs';
import { logger } from './utils';
import { MasterAgent } from './Master';
import type { Websocket } from 'hyper-express';

const workerPool: Map<number, { ip: string; ws: Websocket; init?: boolean }> = new Map();

const port = Number(process.env.PORT) || 3000;
const master = new MasterAgent();
const app = new HyperExpress.Server();
app.use(logger);

app.upgrade('/ws/connect', async (request, response) => {
	const { ip } = request;

	/* add to Ie */

	/* upgrade the incoming request with some context */
	response.upgrade({
		workerNum: workerPool.size + 1,
		workerAddy: ip
	});
});

// Create websocket route to handle opened websocket connections
app.ws('/ws/connect', (ws) => {
	const {
		ip,
		context: { workerNum, workerAddy }
	} = ws;
	workerPool.set(Number(workerNum), { ip, ws });

	ws.send(JSON.stringify({ type: 'INIT', workerNum }));

	// Log when a connection has opened for debugging
	console.log('worker ' + workerNum + ' has connected from ' + workerAddy);

	// Handle incoming messages to perform changes in consumption
	ws.on('message', async (message) => {
		const msg = JSON.parse(message);
		if (msg.type === 'INIT_DONE') {
			workerPool.set(Number(workerNum), { ip, ws, init: true });
			if (workerPool.size > 1) {
				let allInit = false;
				for (const [, { init }] of workerPool) {
					if (!init) break;
					allInit = true;
				}
				master.workerPool = workerPool;
				await master.init();
				await master.train();
			}
		}
		// Make some changes to which events user consumes based on incoming message
	});

	// Do some cleanup once websocket connection closes
	ws.on('close', (code, message) => {
		console.log('worker ' + workerNum + ' has disconnected from ' + workerAddy);
		/* clean up workerMap */
	});
});

app.get('/', async (req, res) => {
	res.status(200).json({ message: 'WELCOME TO THE BALLERANALYTICS A3C RL API! :)' });
});

/* routes for A3C server */
app.post('/global_moving_average', async (req, res) => {
	const { data: avg } = <{ data: number }>await req.json();
	await writeFile(process.cwd() + '/A3C_Data/global_moving_average.txt', avg.toString(), 'utf8');

	res.status(200).json({ status: 'SUCCESS' });
});

app.get('/global_moving_average', async (req, res) => {
	const data = await readFile(process.cwd() + '/A3C_Data/global_moving_average.txt', 'utf8');
	res.status(200).json({ status: 'SUCCESS', data });
});

app.post('/best_score', async (req, res) => {
	const { data: avg } = <{ data: number }>await req.json();
	await writeFile(process.cwd() + '/A3C_Data/best_score.txt', avg.toString(), 'utf8');
	res.status(200).json({ status: 'SUCCESS' });
});

app.get('/best_score', async (req, res) => {
	const data = await readFile(process.cwd() + '/A3C_Data/best_score.txt', 'utf8');
	res.status(200).json({ status: 'SUCCESS', data });
});

/* TODO: Determine whether needed as queue is cleared/reset at start */
app.get('/create_queue', async (req, res) => {
	open(process.cwd() + '/A3C_Data/queue.txt', 'w', function (err, fd) {
		if (err) throw new Error(err.message);
		close(fd, function (err) {
			if (err) throw new Error(err.message);
			res.status(200).json({ status: 'SUCCESS' });
		});
	});
});

app.post('/queue', async (req, res) => {
	const { data: elem } = <{ data: string | number }>await req.json();
	console.log('Queue :' + elem);
	if (elem !== '') await appendFile(process.cwd() + '/A3C_Data/queue.txt', elem.toString() + '\n');
	res.status(200).json({ status: 'SUCCESS' });
});

app.get('/queue', async (req, res) => {
	const data = (await readFile(process.cwd() + '/A3C_Data/queue.txt', 'utf8'))
		.toString()
		.split('\n');
	if (data.length === 1 && data[0] === '') {
		res.status(200).json({ status: 'FAIL', data: 'NaN', err: 'No data in queue' });
	} else {
		const elem_pop = data[0];
		let str = '';
		for (let i = 1; i < data.length; i++) {
			if (data[i] != '') str += data[i] + '\n';
		}
		await writeFile(process.cwd() + '/A3C_Data/queue.txt', str);
		res.status(200).json({ status: 'SUCCESS', data: elem_pop });
	}
});

app.post('/local_model_weights', async (req, res) => {
	const { data_actor, data_critic, temporary } = <
		{ data_actor: DataView; data_critic: DataView; temporary: boolean }
	>await req.json();
	if (temporary) {
		await Promise.all([
			writeFile(
				process.cwd() + '/A3C_Data/temporary-global-model-actor/weights.bin',
				data_actor,
				'binary'
			),
			writeFile(
				process.cwd() + '/A3C_Data/temporary-global-model-critic/weights.bin',
				data_critic,
				'binary'
			)
		]);
	} else {
		await Promise.all([
			writeFile(process.cwd() + '/A3C_Data/global-model-actor/weights.bin', data_actor, 'binary'),
			writeFile(process.cwd() + '/A3C_Data/global-model-critic/weights.bin', data_critic, 'binary')
		]);
	}
	res.status(200).json({ status: 'SUCCESS' });
});

app.get('/global_model_weights_actor', async (req, res) => {
	const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-actor/weights.bin');
	readable.on('error', (error) => console.log(error));
	res.stream(readable);
});

app.get('/global_model_actor', async (req, res) => {
	const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-actor/model.json');
	readable.on('error', (error) => console.log(error));
	res.stream(readable);
});

app.get('/global_model_weights_critic', async (req, res) => {
	const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-critic/weights.bin');
	readable.on('error', (error) => console.log(error));
	res.stream(readable);
});

app.get('/global_model_critic', async (req, res) => {
	const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-critic/model.json');
	readable.on('error', (error) => console.log(error));
	res.stream(readable);
});

app.post('/global_episode', async (req, res) => {
	let data = parseInt(await readFile(process.cwd() + '/A3C_Data/global_episode.txt', 'utf8'));
	data += 1;
	await writeFile(process.cwd() + '/A3C_Data/global_episode.txt', data.toString());
	res.status(200).json({ status: 'SUCCESS' });
});

app.get('/global_episode', async (req, res) => {
	const data = await readFile(process.cwd() + '/A3C_Data/global_episode.txt', 'utf8');
	res.status(200).json({ status: 'SUCCESS', data });
});

app.post('/register_worker', async (req, res) => {
	const { data } = <{ data: string }>await req.json();
	await appendFile(process.cwd() + '/A3C_Data/workers', '\n' + data.toString());
	// TODO: master.addWorker
	res.status(200).json({ status: 'SUCCESS' });
});

/* TODO: add workers tokens table to sqllite3 db */
app.get('/worker_done', async (req, res) => {
	const data = (await readFile(process.cwd() + '/A3C_Data/workers_tokens.txt', 'utf8'))
		.toString()
		.split('\n');
	if (data.length === 1 && data[0] === '') {
		res.status(200).json({ status: 'FAIL', data: 'NaN', err: 'No data in queue' });
	} else {
		const elem_pop = data[0];
		let str = '';
		for (let i = 1; i < data.length; i++) {
			str += data[i] + '\n';
		}
		await writeFile(process.cwd() + '/A3C_Data/queue.txt', str);
		res.status(200).json({ status: 'SUCCESS', data: elem_pop });
	}
});

app.get('/workers_status', async (req, res) => {
	const workers = (await readFile(process.cwd() + '/A3C_Data/workers_tokens.txt', 'utf8'))
		.toString()
		.split('\n');

	res.status(200);

	if (workers.length === 1 && workers[0] === '') {
		res.json({ status: 'SUCCESS', data: 'done' });
	} else {
		res.json({ status: 'SUCCESS', data: workers.length });
	}
});

app.post('/worker_started', async (req, res) => {
	const { data: token } = <{ data: number }>await req.json();
	await appendFile(process.cwd() + '/A3C_Data/workers_tokens.txt', token + '\n');
	res.status(200).json({ status: 'SUCCESS' });
});

app
	.listen(port)
	.then(() => console.log(`> Running on http://localhost:${port}`))
	.catch(console.error);
