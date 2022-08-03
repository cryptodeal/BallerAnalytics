import HyperExpress from 'hyper-express';
import { appendFile, readFile, writeFile } from 'fs/promises';
import { createReadStream } from 'fs';
import { MasterAgent } from './Master';
import { nanoid } from 'nanoid';

export class A3CServer {
	private app!: HyperExpress.Server;
	private socket!: HyperExpress.compressors.us_listen_socket;
	private master = new MasterAgent();

	private globalEpisode = 0;
	private bestScore = 0;
	private globalMovingAvg = 0;

	constructor() {
		const port = Number(process.env.PORT) || 3000;
		this.app = new HyperExpress.Server();

		this.app.upgrade('/ws/connect', async (request, response) => {
			const { ip, headers } = request;
			const { id } = headers;

			/* upgrade the incoming request with some context */
			response.upgrade({
				workerAddy: ip,
				id: id !== '' ? id : nanoid()
			});
		});

		/* handle opened websocket connections */
		this.app.ws('/ws/connect', async (ws) => {
			if (!this.master.isInit) await this.master.init();
			const {
				ip,
				context: { workerAddy, id }
			} = ws;
			const exists = this.master.findWorkerPool(id);
			if (!exists) {
				const workerNum = this.master.workerCount() + 1;
				this.master.setWorkerPool(id, { workerNum, ip, active: true });
			} else {
				const worker = this.master.findWorkerPool(id);
				worker.active = true;
				this.master.setWorkerPool(id, worker);
				const { init, active, training, done, workerNum } = worker;
				this.master.setWorkerMap(workerNum, {
					ip,
					id,
					active,
					init,
					training,
					done
				});
			}

			const { workerNum } = this.master.findWorkerPool(id);
			ws.send(JSON.stringify({ type: 'INIT', workerNum, id }));

			/* log new cxns for debugging */
			console.log('worker ' + workerNum + ' has connected from ' + workerAddy);

			// Handle incoming messages to perform changes in consumption
			ws.on('message', async (message) => {
				const msg = JSON.parse(message);
				const worker = this.master.findWorkerPool(id);
				if (msg.type === 'INIT_DONE') {
					worker.init = true;
					this.master.setWorkerPool(id, worker);
					const { active } = worker;
					this.master.setWorkerMap(workerNum, {
						ip,
						id,
						init: true,
						active
					});
					/* init workers as they are activated */
					ws.send(JSON.stringify({ type: 'RUN', workerNum }));
				} else if (msg.type === 'DONE') {
					worker.done = true;
					this.master.setWorkerPool(id, worker);
					const { active, training, init, done } = worker;
					this.master.setWorkerMap(workerNum, {
						ip,
						id,
						init,
						active,
						done,
						training
					});
				}
			});

			// Do some cleanup once websocket connection closes
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			ws.on('close', (code, message) => {
				console.log('worker ' + workerNum + ' has disconnected from ' + workerAddy);
				/* clean up workerMap */
				const worker = this.master.findWorkerPool(id);
				worker.active = false;
				this.master.setWorkerPool(id, worker);
				const { active, training, init, done } = worker;
				this.master.setWorkerMap(workerNum, {
					ip,
					id,
					active,
					init,
					training,
					done
				});
			});
		});

		this.app.get('/', async (req, res) => {
			res.status(200).json({ message: 'WELCOME TO THE BALLERANALYTICS A3C RL API! :)' });
		});

		/* routes for A3C server */
		this.app.post('/global_moving_average', async (req, res) => {
			const { data } = <{ data: number }>await req.json();
			this.globalMovingAvg = data;
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/global_moving_average', async (req, res) => {
			res.status(200).json({ status: 'SUCCESS', data: this.globalMovingAvg });
		});

		this.app.post('/best_score', async (req, res) => {
			const { data } = <{ data: number }>await req.json();
			this.bestScore = data;
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/best_score', (req, res) => {
			res.status(200).json({ status: 'SUCCESS', data: this.bestScore });
		});

		this.app.post('/queue', async (req, res) => {
			const { data: elem } = <{ data: number | string; workerId: string }>await req.json();
			console.log('Queued Ep Reward: ' + elem);

			if (elem !== '' && typeof elem === 'number') {
				await this.master.queue(elem);
			}
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.post('/local_model_weights', async (req, res) => {
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
					writeFile(
						process.cwd() + '/A3C_Data/global-model-actor/weights.bin',
						data_actor,
						'binary'
					),
					writeFile(
						process.cwd() + '/A3C_Data/global-model-critic/weights.bin',
						data_critic,
						'binary'
					)
				]);
			}
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/global_model_weights_actor', (req, res) => {
			const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-actor/weights.bin');
			readable.on('error', (error) => console.log(error));
			res.stream(readable);
		});

		this.app.get('/global_model_actor', (req, res) => {
			const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-actor/model.json');
			readable.on('error', (error) => console.log(error));
			res.stream(readable);
		});

		this.app.get('/global_model_weights_critic', (req, res) => {
			const readable = createReadStream(
				process.cwd() + '/A3C_Data/global-model-critic/weights.bin'
			);
			readable.on('error', (error) => console.log(error));
			res.stream(readable);
		});

		this.app.get('/global_model_critic', (req, res) => {
			const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-critic/model.json');
			readable.on('error', (error) => console.log(error));
			res.stream(readable);
		});

		this.app.post('/global_episode', (req, res) => {
			this.globalEpisode += 1;
			console.log('Episode: ' + this.globalEpisode);
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/global_episode', (req, res) => {
			res.status(200).json({ status: 'SUCCESS', data: this.globalEpisode });
		});

		/* TODO: add workers tokens table to sqllite3 db */
		this.app.post('/worker_done', async (req, res) => {
			const { ip } = req;
			const { id } = <{ id: string }>await req.json();

			const data = (await readFile(process.cwd() + '/A3C_Data/workers_tokens.txt', 'utf8'))
				.toString()
				.split('\n');

			const worker = this.master.findWorkerPool(id);
			worker.done = true;
			this.master.setWorkerPool(id, worker);
			const { active, training, init, done, workerNum } = worker;
			this.master.setWorkerMap(workerNum, {
				ip,
				id,
				init,
				active,
				done,
				training
			});
			if (data.length === 1 && data[0] === '') {
				res.status(200).json({ status: 'FAIL', data: 'NaN', err: 'No data in queue' });
			} else {
				let str = '';
				for (let i = 0; i < data.length; i++) {
					if (data[i] !== id) str += data[i] + '\n';
				}
				await writeFile(process.cwd() + '/A3C_Data/workers_tokens.txt', str);
				res.status(200).json({ status: 'SUCCESS', data: id });
			}
		});

		this.app.get('/workers_status', async (req, res) => {
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

		this.app.post('/worker_started', async (req, res) => {
			const { ip } = req;
			const { workerNum, id } = <{ workerNum: number; id: string }>await req.json();

			const worker = this.master.findWorkerPool(id);
			worker.training = true;
			this.master.setWorkerPool(id, worker);
			const { active, init, training } = worker;
			this.master.setWorkerMap(workerNum, { id, ip, active, init, training });
			await appendFile(process.cwd() + '/A3C_Data/workers_tokens.txt', id + '\n');
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app
			.listen(port)
			.then((socket: HyperExpress.compressors.us_listen_socket) => {
				this.socket = socket;
				console.log(`> Running on http://localhost:${port}`);
			})
			.catch(console.error);
	}

	public close = () => {
		return new Promise((resolve) => {
			const isClosed = this.app.close(this.socket);
			resolve(isClosed);
		});
	};
}
