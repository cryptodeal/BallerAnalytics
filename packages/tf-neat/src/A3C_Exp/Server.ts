import HyperExpress from 'hyper-express';
import { appendFile, readFile, writeFile } from 'fs/promises';
import { createReadStream, open, close } from 'fs';
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
			const exists = this.master.workerPool.has(id);
			if (!exists) {
				const workerNum = this.master.workerPool.size + 1;
				this.master.workerPool.set(id, { workerNum, ip, active: true });
			} else {
				const worker = <
					{
						ip: string;
						init?: boolean;
						workerNum: number;
						active?: boolean;
						training?: boolean;
						done?: boolean;
					}
				>this.master.workerPool.get(id);
				worker.active = true;
				this.master.workerPool.set(id, worker);
				const { init, active, training, done, workerNum } = worker;
				this.master.workerMap.set(workerNum, {
					ip,
					id,
					active,
					init,
					training,
					done
				});
			}

			const { workerNum } = <
				{
					ip: string;
					init?: boolean;
					workerNum: number;
					active?: boolean;
					training?: boolean;
					done?: boolean;
				}
			>this.master.workerPool.get(id);

			ws.send(JSON.stringify({ type: 'INIT', workerNum, id }));

			/* log new cxns for debugging */
			console.log('worker ' + workerNum + ' has connected from ' + workerAddy);

			// Handle incoming messages to perform changes in consumption
			ws.on('message', async (message) => {
				const msg = JSON.parse(message);
				const worker = <
					{
						ip: string;
						init?: boolean;
						workerNum: number;
						active?: boolean;
						training?: boolean;
						done?: boolean;
					}
				>this.master.workerPool.get(id);
				if (msg.type === 'INIT_DONE') {
					worker.init = true;
					this.master.workerPool.set(id, worker);
					const { active } = worker;
					this.master.workerMap.set(workerNum, {
						ip,
						id,
						init: true,
						active
					});

					/* init workers as they are activated */
					ws.send(JSON.stringify({ type: 'RUN', workerNum }));

					if (!this.master.isTraining) {
						(async () => {
							this.master.isTraining = true;
							await this.master.train();
						})();
					}
				} else if (msg.type === 'DONE') {
					worker.done = true;
					this.master.workerPool.set(id, worker);
					const { active, training, init, done } = worker;
					this.master.workerMap.set(workerNum, {
						ip,
						id,
						init,
						active,
						done,
						training
					});
				}
				/*
          else if (msg.type === 'QUEUE') {
            await this.master.queue(msg.payload.data as number);
          }
        */
			});

			// Do some cleanup once websocket connection closes
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			ws.on('close', (code, message) => {
				console.log('worker ' + workerNum + ' has disconnected from ' + workerAddy);
				/* clean up workerMap */
				const worker = <
					{
						ip: string;
						init?: boolean;
						workerNum: number;
						active?: boolean;
						training?: boolean;
						done?: boolean;
					}
				>this.master.workerPool.get(id);
				worker.active = false;
				this.master.workerPool.set(id, worker);
				const { active, training, init, done } = worker;
				this.master.workerMap.set(workerNum, {
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
			const { data: elem, workerNum } = <{ data: string | number; workerNum: number }>(
				await req.json()
			);
			console.log('Queue: ' + elem);

			if (elem !== '') {
				if (elem === 'done') {
					const { ip } = req;
					const worker = <
						{
							ip: string;
							id: string;
							init?: boolean;
							active?: boolean;
							training?: boolean;
							done?: boolean;
						}
					>this.master.workerMap.get(workerNum);
					worker.done = true;
					this.master.workerMap.set(workerNum, worker);
					const { active, training, init, done, id } = worker;
					this.master.workerPool.set(id, {
						ip,
						workerNum,
						init,
						active,
						done,
						training
					});
					let allDone = true;
					for (const [, { done }] of this.master.workerPool) {
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
			console.log('Global Episode: ' + this.globalEpisode);
			res.status(200).json({ status: 'SUCCESS' });
		});

		this.app.get('/global_episode', (req, res) => {
			res.status(200).json({ status: 'SUCCESS', data: this.globalEpisode });
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
			const { ip } = req;
			const { data: token } = <{ data: number }>await req.json();

			const worker = <
				{
					ip: string;
					id: string;
					init?: boolean;
					active?: boolean;
					training?: boolean;
					done?: boolean;
				}
			>this.master.workerMap.get(token);
			worker.training = true;
			this.master.workerMap.set(token, worker);
			const { active, init, training, id } = worker;
			this.master.workerPool.set(id, { workerNum: token, ip, active, init, training });
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
