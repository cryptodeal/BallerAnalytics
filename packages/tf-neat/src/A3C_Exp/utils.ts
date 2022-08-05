import { readFile, writeFile, stat } from 'fs/promises';
import { fetch } from 'cross-undici-fetch';
import { exec, spawn } from 'child_process';
import minimist from 'minimist';
import type {
	RestApiBase,
	RestApiBaseData,
	RestApiStringData,
	WorkerBaseData,
	WorkerBaseDataId,
	WorkerBaseId,
	WorkerModelData,
	WsApiData,
	WsDone,
	WsInitDone,
	WsInitWorker,
	WsRunWorker
} from './types';

const argv = <{ host?: string; h?: string }>minimist(process.argv.slice(2));

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

export const setGlobalMovingAverage = (avg: number) => {
	return fetch(APIBaseURI + '/global_moving_average', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(<WorkerBaseData>{ data: avg })
	})
		.then((response) => {
			if (response.ok) {
				return <Promise<RestApiBase>>response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const getGlobalMovingAverage = () => {
	return fetch(APIBaseURI + '/global_moving_average')
		.then((response) => {
			if (response.ok) {
				return response.json().then((res: RestApiBaseData) => res.data);
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const setBestScore = (score: number) => {
	return fetch(APIBaseURI + '/best_score', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(<WorkerBaseData>{ data: score })
	})
		.then((response) => {
			if (response.ok) {
				return <Promise<RestApiBase>>response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const getBestScore = () => {
	return fetch(APIBaseURI + '/best_score')
		.then((response) => {
			if (response.ok) {
				return response.json().then((res: RestApiBaseData) => res.data);
			}
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const sendModel = async (id: string, temp: boolean) => {
	const [data_actor, data_critic] = await Promise.all([
		readFile(process.cwd() + `/A3C_Data/local-model-actor/${id}/weights.bin`),
		readFile(process.cwd() + `/A3C_Data/local-model-critic/${id}/weights.bin`)
	]);
	const obj: WorkerModelData = {
		id,
		temporary: temp,
		data_actor,
		data_critic
	};
	return fetch(APIBaseURI + '/local_model_weights', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(obj)
	})
		.then((response) => {
			if (response.ok) {
				return <Promise<RestApiBase>>response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const writeQueue = (data: number, id: string) => {
	return fetch(APIBaseURI + '/queue', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(<WorkerBaseDataId>{ data, id })
	})
		.then((response) => {
			if (response.ok) {
				return <Promise<RestApiBase>>response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const incrementGlobalEpisode = () => {
	return fetch(APIBaseURI + '/global_episode', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then((response) => {
			if (response.ok) {
				return <Promise<RestApiBase>>response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const notifyWorkerDone = (id: string) => {
	return fetch(APIBaseURI + '/worker_done', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(<WorkerBaseId>{ id })
	})
		.then((response) => {
			if (response.ok) {
				return <Promise<RestApiStringData>>response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const getGlobalModelCriticWeights = (id: string) => {
	return new Promise((resolve, reject) => {
		exec(
			'curl ' +
				APIBaseURI +
				'/global_model_weights_critic > ' +
				process.cwd() +
				`/A3C_Data/local-model-critic/${id}/weights.bin`,
			(err, stdout) => {
				if (err) reject(err);
				return resolve(stdout);
			}
		);
	});
};
export const getGlobalModelCriticJSON = (id: string) => {
	return new Promise((resolve, reject) => {
		exec(
			'curl ' +
				APIBaseURI +
				'/global_model_critic > ' +
				process.cwd() +
				`/A3C_Data/local-model-critic/${id}/model.json`,
			(err, stdout) => {
				if (err) reject(err);
				return resolve(stdout);
			}
		);
	});
};

export const getGlobalModelCritic = (id: string) =>
	Promise.all([getGlobalModelCriticWeights(id), getGlobalModelCriticJSON(id)]);

export const getGlobalModelActorWeights = (id: string) => {
	return new Promise((resolve, reject) => {
		exec(
			'curl ' +
				APIBaseURI +
				'/global_model_weights_actor > ' +
				process.cwd() +
				`/A3C_Data/local-model-actor/${id}/weights.bin`,
			(err, stdout) => {
				if (err) reject(err);
				return resolve(stdout);
			}
		);
	});
};

export const getGlobalModelActorJSON = (id: string) => {
	return new Promise((resolve, reject) => {
		exec(
			'curl ' +
				APIBaseURI +
				'/global_model_actor > ' +
				process.cwd() +
				`/A3C_Data/local-model-actor/${id}/model.json`,
			(err, stdout) => {
				if (err) reject(err);
				return resolve(stdout);
			}
		);
	});
};

export const getGlobalModelActor = (id: string) =>
	Promise.all([getGlobalModelActorWeights(id), getGlobalModelActorJSON(id)]);

export const getGlobalEpisode = () => {
	return fetch(APIBaseURI + '/global_episode')
		.then((response) => {
			if (response.ok) {
				return response.json().then((res: RestApiBaseData) => res.data);
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

/* determine return type */
export const checkWorkers = () => {
	return fetch(APIBaseURI + '/workers_status')
		.then((response) => {
			if (response.ok) {
				return response.json().then((res: RestApiStringData | RestApiBaseData) => {
					const { data } = res;
					return data === 'done' ? data : Number(data);
				});
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const waitForWorkers = async () => {
	let data: string | number = 10000;
	while (data !== 0) {
		data = await checkWorkers();
	}
	return data;
};

export const addWorkerId = (id: string) => {
	return fetch(APIBaseURI + '/worker_started', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(<WorkerBaseId>{ id })
	})
		.then((response) => {
			if (response.ok) {
				return <Promise<RestApiBase>>response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const fileExists = async (path: string) => !!(await stat(path).catch(() => false));

export const getWorkersHostNames = async () => {
	const exists = await fileExists(process.cwd() + '/A3C_Data/workers');
	const tempData = 'localhost:8085';
	if (!exists) await writeFile(process.cwd() + '/A3C_Data/workers', tempData, 'utf8');

	return readFile(process.cwd() + '/A3C_Data/workers', 'utf8').then((data) => {
		return data.toString().split('\n');
	});
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
