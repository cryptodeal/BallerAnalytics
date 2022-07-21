import { readFileSync, writeFile } from 'fs';
import { db } from '../../db';
import { exec } from 'bun-utilities';
import { QUEUE_TABLE } from '../../const';
export const APIBaseURI = `http://localhost:${3000}`;

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
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};
export const sendModel = (worker_id: number, temp: boolean) => {
	const obj = {
		idx: worker_id,
		temporary: temp,
		data_actor: readFileSync(import.meta.dir + '/local-model-actor/weights.bin', {
			encoding: 'binary'
		}),
		data_critic: readFileSync(import.meta.dir + '/local-model-critic/weights.bin', {
			encoding: 'binary'
		})
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
				return response.json().then(({ data }) => parseFloat(data));
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
	return fetch(hostURI + '/start_worker')
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

export const getGlobalModelCritic = () => {
	return fetch(APIBaseURI + '/global_model_weights_critic')
		.then((response) => {
			if (response.ok) {
				return response.arrayBuffer().then((buf) => {
					writeFile(import.meta.dir + '/local-model-critic/weights.bin', new DataView(buf), ((
						err
					) => {
						if (err) throw Error(err);
						console.log('saved');
					}) as VoidFunction);
				});
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const getGlobalModelActor = () => {
	return exec([
		'curl ' +
			APIBaseURI +
			'/global_model_weights_actor > ' +
			import.meta.dir +
			'/local-model-actor/weights.bin'
	]);
};

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
				return response.json().then(({ data }) => data);
			}
			return Promise.reject(Error('error'));
		})
		.catch((error) => {
			return Promise.reject(Error(error.message));
		});
};

export const waitForWorkers = async () => {
	let data = 10000;
	while (data !== 0) {
		/* TODO: update type returned by checkWorkers from any to better type */
		data = await checkWorkers();
	}

	return Promise.resolve();
};

export const addWorkerToken = (tok: number) => {
	return fetch(APIBaseURI + '/worker_started')
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

export const getWorkersHostNames = async () => {
	const { VALUE } = <{ VALUE: string; id: number }>(
		await db.prepare(`SELECT * FROM ${QUEUE_TABLE}`).get()
	);
	return VALUE.toString().split('\n');
};
