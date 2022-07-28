import { readFile, writeFile, stat } from 'fs/promises';
import { fetch } from 'cross-undici-fetch';
import { exec } from 'child_process';
import { networkInterfaces } from 'os';

export const APIBaseURI = `http://0.0.0.0:${3000}`;
export const wsBaseURI = `ws://0.0.0.0:${3000}/ws/connect`;

export function logger(req, res, next) {
	console.log(`~> Received ${req.method} on ${req.url}`);
	next(); // move on
}

export const setGlobalMovingAverage = (avg: number) => {
	return fetch(APIBaseURI + '/global_moving_average', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: avg })
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
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
				return response.json().then(({ data }) => data);
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
		body: JSON.stringify({ data: score })
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
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
				return response.json().then(({ data }) => parseFloat(data));
			}
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const sendModel = async (worker_id: number, temp: boolean) => {
	const [data_actor, data_critic] = await Promise.all([
		readFile(process.cwd() + '/A3C_Data/local-model-actor/weights.bin', {
			encoding: 'binary'
		}),
		readFile(process.cwd() + '/A3C_Data/local-model-critic/weights.bin', {
			encoding: 'binary'
		})
	]);
	const obj = {
		idx: worker_id,
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
				return response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const createQueue = () => {
	return fetch(APIBaseURI + '/create_queue')
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const writeQueue = (data: number | string) => {
	return fetch(APIBaseURI + '/queue', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data })
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const getQueue = () => {
	return fetch(APIBaseURI + '/queue')
		.then((response) => {
			if (response.ok) {
				return response.json().then(({ data }) => {
					if (data === 'NaN' || data === 'done') {
						return data;
					} else {
						return parseFloat(data);
					}
				});
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getBlockingQueue = async () => {
	let data: number | 'NaN' | 'done' = 'NaN';
	while (data === 'NaN') {
		data = await getQueue();
		await sleep(750);
	}
	return Promise.resolve(data);
};

export const startWorker = (hostURI: string) => {
	console.log(hostURI);
	return fetch('http://' + hostURI + '/start_worker')
		.then((response) => {
			if (response.ok) {
				return response.json();
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
				return response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const notifyWorkerDone = () => {
	return fetch(APIBaseURI + '/worker_done')
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const getGlobalModelCriticWeights = () => {
	return new Promise((resolve, reject) => {
		exec(
			'curl ' +
				APIBaseURI +
				'/global_model_weights_critic > ' +
				process.cwd() +
				'/A3C_Data/local-model-critic/weights.bin',
			(err, stdout) => {
				if (err) reject(err);
				return resolve(stdout);
			}
		);
	});
};
export const getGlobalModelCriticJSON = () => {
	return new Promise((resolve, reject) => {
		exec(
			'curl ' +
				APIBaseURI +
				'/global_model_critic > ' +
				process.cwd() +
				'/A3C_Data/local-model-critic/model.json',
			(err, stdout) => {
				if (err) reject(err);
				return resolve(stdout);
			}
		);
	});
};

export const getGlobalModelCritic = () =>
	Promise.all([getGlobalModelCriticWeights(), getGlobalModelCriticJSON()]);

export const getGlobalModelActorWeights = () => {
	return new Promise((resolve, reject) => {
		exec(
			'curl ' +
				APIBaseURI +
				'/global_model_weights_actor > ' +
				process.cwd() +
				'/A3C_Data/local-model-actor/weights.bin',
			(err, stdout) => {
				if (err) reject(err);
				return resolve(stdout);
			}
		);
	});
};

export const getGlobalModelActorJSON = () => {
	return new Promise((resolve, reject) => {
		exec(
			'curl ' +
				APIBaseURI +
				'/global_model_actor > ' +
				process.cwd() +
				'/A3C_Data/local-model-actor/model.json',
			(err, stdout) => {
				if (err) reject(err);
				return resolve(stdout);
			}
		);
	});
};

export const getGlobalModelActor = () =>
	Promise.all([getGlobalModelActorWeights(), getGlobalModelActorJSON()]);

export const getGlobalEpisode = () => {
	return fetch(APIBaseURI + '/global_episode')
		.then((response) => {
			if (response.ok) {
				return response.json().then(({ data }) => parseFloat(data));
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const setGlobalEpisode = (ep: number) => {
	return fetch(APIBaseURI + '/global_episode', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: ep })
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

/* determine return type */
export const checkWorkers = () => {
	return fetch(APIBaseURI + '/worker_status')
		.then((response) => {
			if (response.ok) {
				return response.json().then((res: { data: 'done' | number }) => {
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
		/* TODO: update type returned by checkWorkers from any to better type */
		data = await checkWorkers();
	}

	return Promise.resolve();
};

export const addWorkerToken = (tok: number) => {
	return fetch(APIBaseURI + '/worker_started', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: tok })
	})
		.then((response) => {
			if (response.ok) {
				return response;
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const registerWorker = (port: number) => {
	const localIp = networkInterfaces['Local Area Connection 3'][1].address;
	return fetch(APIBaseURI + '/register_worker', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: localIp + port.toString() })
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
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