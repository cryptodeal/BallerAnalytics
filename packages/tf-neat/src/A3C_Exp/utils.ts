import { readFile, writeFile, stat } from 'fs/promises';
import { fetch } from 'cross-undici-fetch';
import { spawn } from 'child_process';
import minimist from 'minimist';
import type {
	AgentWeights,
	RestApiBase,
	RestApiBaseData,
	RestApiStringData,
	SharedAgentWeights,
	WorkerBaseData,
	WorkerModelData,
	WsApiData,
	WsDone,
	WsInitDone,
	WsInitWorker,
	WsRunWorker
} from './types';
import { tensor } from '@tensorflow/tfjs-node';
import type { Tensor, Rank } from '@tensorflow/tfjs-node';

async function http<T>(routePath: string, opts?: RequestInit): Promise<T> {
	return fetch(APIBaseURI + routePath, opts)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`name: ${res.status}, message: ${res.statusText}}`);
			}
			// may error if there is no body, return empty array
			return res.json();
		})
		.catch(() => console.error('ERROR -- METHOD: ' + opts?.method, 'path: ' + routePath));
}

export const fetchApi = {
	get: <T>(path: string, config?: RequestInit): Promise<T> => {
		let headers: HeadersInit = {};
		if (config?.headers) {
			headers = { ...headers, ...config.headers };
			delete config.headers;
		}
		const init = { method: 'GET', headers, ...config };
		return http<T>(path, init);
	},

	post: <T, U>(path: string, body: T, config?: RequestInit): Promise<U> => {
		let headers: HeadersInit = {
			'Content-Type': 'application/json'
		};
		if (config?.headers) {
			headers = { ...headers, ...config.headers };
			delete config.headers;
		}
		const init = {
			method: 'POST',
			body: JSON.stringify(body),
			headers,
			...config
		};
		return http<U>(path, init);
	}
};
export enum ApiPaths {
	BASE = '/',
	WS = '/ws/connect',
	GLOB_MOV_AVG = '/global_moving_average',
	WORKER_MOV_AVG = '/best_worker_moving_average',
	BEST_SCORE = '/best_score',
	QUEUE = '/queue',
	SET_GLOB_WEIGHTS = '/local_model_weights',
	SYNC_WEIGHTS = '/shared_agent_weights',
	GLOB_EP = '/global_episode',
	WORKER_DONE = '/worker_done',
	WORKERS_STATUS = '/workers_status',
	WORKER_START = '/worker_started'
}

/* TODO: SWITCH TO USE ID IN FETCH HEADER FOR AUTH/IDENTIFICATION OF WORKER */

const argv = <{ host?: string; h?: string }>minimist(process.argv.slice(2));

const countFlags = <{ spawnCount?: number; c?: number }>minimist(process.argv.slice(2));
let spawnCount = 1;
if (countFlags.spawnCount || countFlags.c)
	spawnCount = countFlags.spawnCount ? countFlags.spawnCount : countFlags.c ? countFlags.c : 1;

export const spawn_worker_count = spawnCount;

let host = '0.0.0.0';
// specify host using -h or --host arg
if (argv.host || argv.h) host = argv.host ? argv.host : argv.h ? argv.h : '0.0.0.0';

export const APIBaseURI = `http://${host}:${3000}`;
export const wsBaseURI = `ws://${host}:${3000}/ws/connect`;

export const logger = (req, res, next) => {
	console.log(`~> Received ${req.method} on ${req.url}`);
	next();
};

export const execute = (command: string) => {
	return new Promise((resolve, reject) => {
		const onExit = (error) => {
			if (error) {
				return reject(error);
			}
			resolve(undefined);
		};
		spawn(command.split(' ')[0], command.split(' ').slice(1), {
			stdio: 'inherit',
			shell: true
		}).on('exit', onExit);
	});
};

export const setGlobalMovingAverage = (id: string, avg: number) =>
	fetchApi.post<WorkerBaseData, RestApiBase>(
		ApiPaths.GLOB_MOV_AVG,
		{ data: avg },
		{ headers: { id } }
	);

export const getGlobalMovingAverage = (id: string) => {
	return fetchApi.get<RestApiBaseData>(ApiPaths.GLOB_MOV_AVG, { headers: { id } }).then((res) => {
		/* TODO: optimize this LOL */
		for (const [key, val] of Object.entries(res)) {
			res[key] = parseInfinity(key, val);
		}
		return res.data;
	});
};

export const setBestWorkerMovingAvg = (id: string, avg: number) =>
	fetchApi.post<WorkerBaseData, RestApiBase>(
		ApiPaths.WORKER_MOV_AVG,
		{ data: avg },
		{ headers: { id } }
	);

export const getBestWorkerMovingAvg = (id: string) => {
	return fetchApi.get<RestApiBaseData>(ApiPaths.WORKER_MOV_AVG, { headers: { id } }).then((res) => {
		/* TODO: optimize this LOL */
		for (const [key, val] of Object.entries(res)) {
			res[key] = parseInfinity(key, val);
		}
		return res.data;
	});
};

export const setBestScore = (id: string, score: number) =>
	fetchApi.post<WorkerBaseData, RestApiBase>(
		ApiPaths.BEST_SCORE,
		{ data: score },
		{ headers: { id } }
	);

export const getBestScore = (id: string) => {
	return fetchApi.get<RestApiBaseData>(ApiPaths.BEST_SCORE, { headers: { id } }).then((res) => {
		/* TODO: optimize this LOL */
		for (const [key, val] of Object.entries(res)) {
			res[key] = parseInfinity(key, val);
		}
		return res.data;
	});
};

export const sendModel = (id: string, weights: AgentWeights, temp = false) => {
	const { actor_weights, critic_weights } = weights;
	return fetchApi.post<WorkerModelData, RestApiBase>(
		ApiPaths.SET_GLOB_WEIGHTS,
		{
			temporary: temp,
			data_actor: actor_weights,
			data_critic: critic_weights
		},
		{ headers: { id } }
	);
};

export const writeQueue = (id: string, data: number) =>
	fetchApi.post<WorkerBaseData, RestApiBase>(ApiPaths.QUEUE, { data }, { headers: { id } });

export const incrementGlobalEpisode = (id: string) =>
	fetchApi.post<unknown, RestApiBase>(ApiPaths.GLOB_EP, {}, { headers: { id } });

export const notifyWorkerDone = (id: string) =>
	fetchApi.post<unknown, RestApiBase>(ApiPaths.WORKER_DONE, {}, { headers: { id } });

export const getSharedWeights = (id: string) =>
	fetchApi.get<SharedAgentWeights>(ApiPaths.SYNC_WEIGHTS, { headers: { id } });

export const getGlobalEpisode = (id: string) => {
	return fetchApi
		.get<RestApiBaseData>(ApiPaths.GLOB_EP, { headers: { id } })
		.then((res) => res.data);
};

/* determine return type */
export const checkWorkers = () => {
	return fetchApi
		.get<RestApiStringData | RestApiBaseData>(ApiPaths.WORKERS_STATUS)
		.then((res: RestApiStringData | RestApiBaseData) => {
			const { data } = res;
			return data === 'done' ? data : Number(data);
		});
};

export const waitForWorkers = async () => {
	let data: string | number = 10000;
	while (data !== 0) {
		data = await checkWorkers();
	}
	return data;
};

export const addWorkerId = (id: string) =>
	fetchApi.post<unknown, RestApiBase>(ApiPaths.WORKER_START, {}, { headers: { id } });

export const fileExists = async (path: string) => !!(await stat(path).catch(() => false));

export const getWorkersHostNames = async () => {
	const exists = await fileExists(process.cwd() + '/A3C_Data/workers');
	const tempData = 'localhost:8085';
	if (!exists) await writeFile(process.cwd() + '/A3C_Data/workers', tempData, 'utf8');

	return readFile(process.cwd() + '/A3C_Data/workers', 'utf8').then((data) => {
		return data.toString().split('\n');
	});
};

export const prepWeights = (weights: Tensor<Rank>[]) => {
	const size = weights.length;
	const parsedWeights: Array<
		| number
		| number[]
		| number[][]
		| number[][][]
		| number[][][][]
		| number[][][][][]
		| number[][][][][][]
	> = new Array(size);
	for (let i = 0; i < size; i++) {
		parsedWeights[i] = weights[i].arraySync();
	}
	return parsedWeights;
};

export const parseWeights = (
	weights: Array<
		| number
		| number[]
		| number[][]
		| number[][][]
		| number[][][][]
		| number[][][][][]
		| number[][][][][][]
	>
) => {
	const size = weights.length;
	const parsedWeights: Tensor<Rank>[] = new Array(weights.length);
	for (let i = 0; i < size; i++) {
		parsedWeights[i] = tensor(weights[i]);
	}
	return parsedWeights;
};

/**
 * We want to serialise :
 *  - the websites
 * - the episode
 * - current step
 * - current website
 * - algo parameters
 * - crawler parameters
 * -the Q values
 */
export const serialize = (to_serialise: object, filename = 'program_state.json') =>
	writeFile(`${process.cwd()}/A3C_Data/logs/${filename}`, JSON.stringify(to_serialise));

export const deserialize = async (path: string) => readFile(path, 'utf-8');

export const stringifyInfinity = (key: string, value: unknown) => {
	switch (value) {
		case Infinity:
			return 'Infinity';
		case -Infinity:
			return '-Infinity';
		default:
			return value;
	}
};

export const parseInfinity = (key: string, value: unknown) => {
	switch (value) {
		case 'Infinity':
			return Infinity;
		case '-Infinity':
			return -Infinity;
		default:
			return value;
	}
};

export const parseWsMsg = (msg: string) => {
	const parsed: WsApiData = JSON.parse(msg);
	switch (parsed.type) {
		case 'INIT':
			return <WsInitWorker>parsed;
		case 'RUN':
			return <WsRunWorker>parsed;
		case 'INIT_DONE':
			return <WsInitDone>parsed;
		case 'DONE':
			return <WsDone>parsed;
		default:
			return parsed;
	}
};

export const isWsInitWorker = (obj: WsApiData): obj is WsInitWorker => {
	return 'type' in obj && obj.type === 'INIT';
};

export const isWsRunWorker = (obj: WsApiData): obj is WsRunWorker => {
	return 'type' in obj && obj.type === 'RUN';
};

export const isWsInitDone = (obj: WsApiData): obj is WsInitDone => {
	return 'type' in obj && obj.type === 'INIT_DONE';
};

export const isWsDone = (obj: WsApiData): obj is WsDone => {
	return 'type' in obj && obj.type === 'DONE';
};
