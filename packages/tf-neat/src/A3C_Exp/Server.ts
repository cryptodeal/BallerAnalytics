import HyperExpress from 'hyper-express';
import { appendFile, readFile, writeFile } from 'fs/promises';
import { createReadStream, open, close } from 'fs';
import { MasterAgent } from './Master';

export class A3CServer {
	private app!: HyperExpress.Server;
	private socket!: HyperExpress.compressors.us_listen_socket;
	private workerPool: Map<
		number,
		{ ip: string; init?: boolean; active?: boolean; training?: boolean; done?: boolean }
	>;
	private workerMap: Map<
		string,
		{ workerNum: number; init?: boolean; active?: boolean; training?: boolean; done?: boolean }
	>;

	constructor() {
		this.workerPool = new Map();
		this.workerMap = new Map();
		const port = Number(process.env.PORT) || 3000;
		const master = new MasterAgent();
		this.app = new HyperExpress.Server();

		this.app.upgrade('/ws/connect', async (request, response) => {
			const { ip } = request;
			const exists = this.workerMap.get(ip);
			const workerNum = exists ? exists.workerNum : this.workerPool.size + 1;
			/* upgrade the incoming request with some context */
			response.upgrade({
				workerNum,
				exists: exists ? true : false,
				workerAddy: ip
			});
		});

		/* handle opened websocket connections */
		this.app.ws('/ws/connect', async (ws) => {
			if (!master.isInit) await master.init();
			const {
				ip,
				context: { workerNum, workerAddy, exists }
			} = ws;
			if (!exists) {
				this.workerPool.set(Number(workerNum), { ip, active: true });
				this.workerMap.set(workerAddy, { workerNum: Number(workerNum), active: true });
			} else {
				const worker = <
					{
						ip: string;
						init?: boolean | undefined;
						active?: boolean;
						training?: boolean;
						done?: boolean;
					}
				>this.workerPool.get(Number(workerNum));
				worker.active = true;
				this.workerPool.set(Number(workerNum), worker);
				const { init, active, training, done } = worker;
				this.workerMap.set(workerAddy, {
					workerNum: Number(workerNum),
					active,
					init,
					training,
					done
				});
			}

			ws.send(JSON.stringify({ type: 'INIT', workerNum }));

			/* log new cxns for debugging */
			console.log('worker ' + workerNum + ' has connected from ' + workerAddy);

			// Handle incoming messages to perform changes in consumption
			ws.on('message', async (message) => {
				const msg = JSON.parse(message);
				const worker = <
					{
						ip: string;
						init?: boolean | undefined;
						active?: boolean;
						training?: boolean;
						done?: boolean;
					}
				>this.workerPool.get(Number(workerNum));
				if (msg.type === 'INIT_DONE') {
					worker.init = true;
					this.workerPool.set(Number(workerNum), worker);
					const { active } = worker;
					this.workerMap.set(workerAddy, {
						workerNum: Number(workerNum),
						init: true,
						active
					});

					/* init workers as they are activated */
					ws.send(JSON.stringify({ type: 'RUN', workerNum }));
					if (!master.isTraining) {
						(async () => {
							master.isTraining = true;
							await master.train();
						})();
					}
				} else if (msg.type === 'DONE') {
					worker.done = true;
					this.workerPool.set(Number(workerNum), worker);
					const { active, training, init, done } = worker;
					this.workerMap.set(workerAddy, {
						workerNum: Number(workerNum),
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
				const worker = <
					{
						ip: string;
						init?: boolean | undefined;
						active?: boolean;
						training?: boolean;
						done?: boolean;
					}
				>this.workerPool.get(Number(workerNum));
				worker.active = false;
				this.workerPool.set(Number(workerNum), worker);
				const { active, training, init, done } = worker;
				this.workerMap.set(workerAddy, {
					workerNum: Number(workerNum),
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
			const { data: avg } = <{ data: number }>await req.json();
			await writeFile(
				process.cwd() + '/A3C_Data/global_moving_average.txt',
				avg.toString(),
				'utf8'
			);

			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/global_moving_average', async (req, res) => {
			const data = await readFile(process.cwd() + '/A3C_Data/global_moving_average.txt', 'utf8');
			res.status(200).json({ status: 'SUCCESS', data });
		});

		this.app.post('/best_score', async (req, res) => {
			const { data: avg } = <{ data: number }>await req.json();
			await writeFile(process.cwd() + '/A3C_Data/best_score.txt', avg.toString(), 'utf8');
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/best_score', async (req, res) => {
			const data = await readFile(process.cwd() + '/A3C_Data/best_score.txt', 'utf8');
			res.status(200).json({ status: 'SUCCESS', data });
		});

		/* TODO: Determine whether needed as queue is cleared/reset at start */
		this.app.get('/create_queue', async (req, res) => {
			open(process.cwd() + '/A3C_Data/queue.txt', 'w', function (err, fd) {
				if (err) throw new Error(err.message);
				close(fd, function (err) {
					if (err) throw new Error(err.message);
					res.status(200).json({ status: 'SUCCESS' });
				});
			});
		});

		this.app.post('/queue', async (req, res) => {
			const { data: elem } = <{ data: string | number }>await req.json();
			console.log('Queue: ' + elem);

			if (elem !== '') {
				if (elem === 'done') {
					const { ip } = req;
					const worker = <
						{
							workerNum: number;
							init?: boolean;
							active?: boolean;
							training?: boolean;
							done?: boolean;
						}
					>this.workerMap.get(ip);
					worker.done = true;
					this.workerMap.set(ip, worker);
					const { active, training, init, done, workerNum } = worker;
					this.workerPool.set(Number(workerNum), {
						ip,
						init,
						active,
						done,
						training
					});
					let allDone = true;
					for (const [, { done }] of this.workerPool) {
						if (!done) {
							allDone = false;
							break;
						}
					}
					if (allDone)
						await appendFile(process.cwd() + '/A3C_Data/queue.txt', elem.toString() + '\n');
				} else {
					await appendFile(process.cwd() + '/A3C_Data/queue.txt', elem.toString() + '\n');
				}
			}
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/queue', async (req, res) => {
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

		this.app.get('/global_model_weights_actor', async (req, res) => {
			const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-actor/weights.bin');
			readable.on('error', (error) => console.log(error));
			res.stream(readable);
		});

		this.app.get('/global_model_actor', async (req, res) => {
			const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-actor/model.json');
			readable.on('error', (error) => console.log(error));
			res.stream(readable);
		});

		this.app.get('/global_model_weights_critic', async (req, res) => {
			const readable = createReadStream(
				process.cwd() + '/A3C_Data/global-model-critic/weights.bin'
			);
			readable.on('error', (error) => console.log(error));
			res.stream(readable);
		});

		this.app.get('/global_model_critic', async (req, res) => {
			const readable = createReadStream(process.cwd() + '/A3C_Data/global-model-critic/model.json');
			readable.on('error', (error) => console.log(error));
			res.stream(readable);
		});

		this.app.post('/global_episode', async (req, res) => {
			const globalEpData = await readFile(process.cwd() + '/A3C_Data/global_episode.txt', 'utf8');
			let data = parseInt(globalEpData);
			console.log('Global Episode: ' + data);
			data += 1;
			await writeFile(process.cwd() + '/A3C_Data/global_episode.txt', data.toString());
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/global_episode', async (req, res) => {
			const data = await readFile(process.cwd() + '/A3C_Data/global_episode.txt', 'utf8');
			res.status(200).json({ status: 'SUCCESS', data });
		});

		/* TODO: add workers tokens table to sqllite3 db */
		this.app.get('/worker_done', async (req, res) => {
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
				await writeFile(process.cwd() + '/A3C_Data/workers_tokens.txt', str);
				res.status(200).json({ status: 'SUCCESS', data: elem_pop });
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
			const { data: token } = <{ data: number }>await req.json();
			const worker = <
				{
					ip: string;
					init?: boolean | undefined;
					active?: boolean;
					training?: boolean;
					done?: boolean;
				}
			>this.workerPool.get(token);
			worker.training = true;
			this.workerPool.set(token, worker);
			const { active, init, training } = worker;
			this.workerMap.set(req.ip, { workerNum: token, active, init, training });
			await appendFile(process.cwd() + '/A3C_Data/workers_tokens.txt', token + '\n');
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
