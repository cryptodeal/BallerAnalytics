import HyperExpress from 'hyper-express';
import { writeFileSync } from 'fs';
import { createReadStream } from 'fs';
import { MasterAgent } from './Master';
import { nanoid } from 'nanoid';
import {
	RestApiBase,
	RestApiBaseData,
	RestApiError,
	RestApiStringData,
	WorkerBaseData,
	WorkerBaseDataId,
	WorkerBaseId,
	WorkerModelData,
	WsInitWorker,
	WsRunWorker
} from './types';
import { isWsDone, isWsInitDone, parseWsMsg, stringifyInfinity } from './utils';

export class A3CServer {
	private app!: HyperExpress.Server;
	private socket!: HyperExpress.compressors.us_listen_socket;
	private master = new MasterAgent();
	private globalEpisode = 0;
	private bestScore = -Infinity;
	private globalMovingAvg = -Infinity;
	private bestWorkerMovingAvg = -Infinity;
	private globalModelReady = false;

	constructor() {
		const port = Number(process.env.PORT) || 3000;
		this.app = new HyperExpress.Server();

		this.app.upgrade('/ws/connect', async (request, response) => {
			const { ip, headers } = request;
			const { id } = headers;

			/* TODO: REMOVE THIS; FOR DEBUGGING */
			console.log(headers);
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
			const exists = this.master.hasWorkerPool(id);
			if (!exists) {
				const first = !this.master.workerCount();
				this.master.setWorkerPool(id, {
					ip,
					active: true,
					first
				});
				/* log new cxns for debugging */
				this.wsCxnLogger(id, workerAddy, WsCxnType.OPEN);

				ws.send(
					JSON.stringify(<WsInitWorker>{
						type: 'INIT',
						payload: {
							id,
							first,
							loadGlobal: this.globalModelReady ? true : false
						}
					})
				);
			} else {
				const worker = this.master.findWorkerPool(id);
				worker.active = true;
				this.master.setWorkerPool(id, worker);
				/* log re-cxns for debugging */
				this.wsCxnLogger(id, workerAddy, WsCxnType.REOPEN);
			}

			// Handle incoming messages to perform changes in consumption
			ws.on('message', async (message) => {
				const msg = parseWsMsg(message);
				const worker = this.master.findWorkerPool(id);
				if (isWsInitDone(msg)) {
					worker.init = true;
					this.master.setWorkerPool(id, worker);
					/* init workers as they are activated */
					ws.send(JSON.stringify(<WsRunWorker>{ type: 'RUN' }));
				} else if (isWsDone(msg)) {
					worker.done = true;
					this.master.setWorkerPool(id, worker);
				}
			});

			// Do some cleanup once websocket connection closes
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			ws.on('close', (code, message) => {
				/* log closed cxns for debugging */
				/* clean up workerMap */
				if (this.master.hasWorkerPool(id)) {
					const worker = this.master.findWorkerPool(id);
					worker.active = false;
					this.master.setWorkerPool(id, worker);
					this.wsCxnLogger(id, workerAddy, WsCxnType.CLOSE);
				}
			});
		});

		this.app.get('/', async (req, res) => {
			res.status(200).json({
				status: RestApiStatus.SUCCESS,
				data: 'WELCOME TO THE BALLERANALYTICS A3C RL API! :)'
			});
		});

		/* routes for A3C server */
		this.app.post('/global_moving_average', async (req, res) => {
			const { data } = <{ data: number }>await req.json();
			if (data > this.bestWorkerMovingAvg) this.bestWorkerMovingAvg = data;

			res.status(200).json(<RestApiBase>{
				status: RestApiStatus.SUCCESS
			});
		});

		this.app.get('/global_moving_average', async (req, res) => {
			res
				.status(200)
				.type('json')
				.send(
					JSON.stringify(
						<RestApiBaseData>{
							status: RestApiStatus.SUCCESS,
							data: this.globalMovingAvg
						},
						stringifyInfinity
					)
				);
		});

		this.app.post('/best_worker_moving_avg', async (req, res) => {
			const { data } = <{ data: number }>await req.json();
			if (data > this.globalMovingAvg) this.globalMovingAvg = data;

			res.status(200).json(<RestApiBase>{
				status: RestApiStatus.SUCCESS
			});
		});

		this.app.get('/best_worker_moving_avg', async (req, res) => {
			res
				.status(200)
				.type('json')
				.send(
					JSON.stringify(
						<RestApiBaseData>{
							status: RestApiStatus.SUCCESS,
							data: this.bestWorkerMovingAvg
						},
						stringifyInfinity
					)
				);
		});

		this.app.post('/best_score', async (req, res) => {
			const { data } = <WorkerBaseData>await req.json();
			if (data > this.bestScore) this.bestScore = data;

			res.status(200).json(<RestApiBase>{ status: RestApiStatus.SUCCESS });
		});

		this.app.get('/best_score', (req, res) => {
			res
				.status(200)
				.type('json')
				.send(
					JSON.stringify(
						<RestApiBaseData>{
							status: RestApiStatus.SUCCESS,
							data: this.bestScore
						},
						stringifyInfinity
					)
				);
		});

		this.app.post('/queue', async (req, res) => {
			const { data: elem } = <WorkerBaseDataId>await req.json();

			console.log('Queued Ep Reward: ' + elem);
			await this.master.queue(elem);

			res.status(200).json(<RestApiBase>{ status: RestApiStatus.SUCCESS });
		});

		this.app.post('/local_model_weights', async (req, res) => {
			const { data_actor, data_critic, temporary } = <WorkerModelData>await req.json();
			/**
			 * fs/promises introduces race condition where
			 * any worker can request weights.bin while it's
			 * being written; writeFileSync resolves by blocking
			 * the main thread while the file is being written.
			 */
			if (temporary) {
				writeFileSync(
					process.cwd() + '/A3C_Data/temporary-global-model-actor/weights.bin',
					Buffer.from(data_actor)
				);
				writeFileSync(
					process.cwd() + '/A3C_Data/temporary-global-model-critic/weights.bin',
					Buffer.from(data_critic)
				);
			} else {
				writeFileSync(
					process.cwd() + '/A3C_Data/global-model-actor/weights.bin',
					Buffer.from(data_actor)
				);

				writeFileSync(
					process.cwd() + '/A3C_Data/global-model-critic/weights.bin',
					Buffer.from(data_critic)
				);
				this.globalModelReady = true;
			}
			res.status(200).json(<RestApiBase>{ status: RestApiStatus.SUCCESS });
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
			console.log(`Episode: ${++this.globalEpisode}`);
			res.status(200).json(<RestApiBase>{ status: RestApiStatus.SUCCESS });
		});

		this.app.get('/global_episode', (req, res) => {
			res
				.status(200)
				.json(<RestApiBaseData>{ status: RestApiStatus.SUCCESS, data: this.globalEpisode });
		});

		/* TODO: add workers tokens table to sqllite3 db */
		this.app.post('/worker_done', async (req, res) => {
			const { id } = <WorkerBaseId>await req.json();

			if (!this.master.workerCount()) {
				res
					.status(200)
					.json(<RestApiError>{ status: RestApiStatus.FAIL, err: 'No workers in pool' });
			} else {
				this.master.removeWorker(id);
				this.workerCxnLogger(id);
				res.status(200).json(<RestApiStringData>{ status: RestApiStatus.SUCCESS, data: id });
			}
		});

		this.app.get('/workers_status', async (req, res) => {
			const workerCount = this.master.workerCount();

			let body: RestApiStringData | RestApiBaseData;
			if (!this.master.workerCount() || this.master.allWorkersDone()) {
				body = { status: RestApiStatus.SUCCESS, data: 'done' };
			} else {
				body = { status: RestApiStatus.SUCCESS, data: workerCount };
			}

			res.status(200).json(body);
		});

		this.app.post('/worker_started', async (req, res) => {
			const { id } = <WorkerBaseId>await req.json();

			const worker = this.master.findWorkerPool(id);
			worker.training = true;
			this.master.setWorkerPool(id, worker);

			res.status(200).json(<RestApiBase>{ status: RestApiStatus.SUCCESS });
		});

		this.app
			.listen(port)
			.then((socket: HyperExpress.compressors.us_listen_socket) => {
				this.socket = socket;
				console.log(`> Running on http://localhost:${port}`);
			})
			.catch(console.error);
	}

	private wsCxnLogger(id: string, ip: string, type: WsCxnType) {
		const eventMsg =
			type === WsCxnType.OPEN
				? 'connected'
				: type === WsCxnType.CLOSE
				? 'disconnected'
				: 'reconnected';
		console.log(`worker ${id} has ${eventMsg} from ${ip}`);
		console.log(`${this.master.activeInPool()} / ${this.master.workerCount()} workers online!`);
	}

	private workerCxnLogger(id: string) {
		console.log(`worker ${id} has finished training`);
		const workerCount = this.master.workerCount();
		if (!workerCount) {
			console.log(`No workers in pool training global model!`);
		} else {
			console.log(`${workerCount} workers in pool training global model!`);
		}
	}

	public close = () => {
		return new Promise((resolve) => {
			const isClosed = this.app.close(this.socket);
			resolve(isClosed);
		});
	};
}

export enum WsCxnType {
	OPEN,
	CLOSE,
	REOPEN
}

export enum RestApiStatus {
	SUCCESS = 'SUCCESS',
	FAIL = 'FAIL'
}
