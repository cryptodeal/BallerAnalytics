import { json } from 'body-parser';
import polka from 'polka';
import send from '@polka/send-type';
import { appendFile, readFile, writeFile } from 'fs/promises';
import { createReadStream, close, open } from 'fs';

const port = process.env.PORT || 3000;
//const master = new MasterAgent(1);
export const app = polka();
app.use(json({ limit: '20mb' }));

app.get('/', (req, res) => {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ message: 'WELCOME TO THE BALLERANALYTICS A3C RL API! :)' }));
});

/* routes for A3C server */
app.post('/global_moving_average', async (req, res) => {
	console.log('Updating global moving average');
	const avg = req.body.data;
	await writeFile(process.cwd() + '/A3C_Data/global_moving_average.txt', avg.toString(), 'utf8');

	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS' }));
});

app.get('/global_moving_average', async (req, res) => {
	console.log('Get global moving average');
	const data = await readFile(process.cwd() + '/A3C_Data/global_moving_average.txt', 'utf8');
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS', data }));
});

app.post('/best_score', async (req, res) => {
	console.log('Updating best_score');
	const avg = req.body.data;
	await writeFile(process.cwd() + '/A3C_Data/best_score.txt', avg.toString(), 'utf8');
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS' }));
});

app.get('/best_score', async (req, res) => {
	console.log('Get best_score');
	const data = await readFile(process.cwd() + '/A3C_Data/best_score.txt', 'utf8');
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS', data }));
});

/* TODO: Determine whether needed as queue is cleared/reset at start */
app.get('/create_queue', async (req, res) => {
	open(process.cwd() + '/A3C_Data/queue.txt', 'w', (err, fd) => {
		if (err) throw new Error(err.message);
		close(fd, (err) => {
			res.writeHead(200, {
				'Content-Type': 'application/json'
			});
			res.end(JSON.stringify({ status: 'SUCCESS' }));
		});
	});
});

app.post('/queue', async (req, res) => {
	console.log('Adding to queue');
	const elem = req.body.data;
	console.log('Queue :' + elem);

	if (elem !== '') await appendFile(process.cwd() + '/A3C_Data/queue.txt', elem.toString() + '\n');

	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS' }));
});

app.get('/queue', async (req, res) => {
	const data = (await readFile(process.cwd() + '/A3C_Data/queue.txt', 'utf8'))
		.toString()
		.split('\n');
	if (data.length === 1 && data[0] === '') {
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		res.end(JSON.stringify({ status: 'FAIL', data: 'NaN', err: 'No data in queue' }));
	} else {
		const elem_pop = data[0];
		let str = '';
		for (let i = 1; i < data.length; i++) {
			if (data[i] != '') str += data[i] + '\n';
		}
		await writeFile(process.cwd() + '/A3C_Data/queue.txt', str);
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		res.end(JSON.stringify({ status: 'SUCCESS', data: elem_pop }));
	}
});

app.post('/local_model_weights', async (req, res) => {
	console.log('Saving local model into global model...');
	const data_actor = req.body.data_actor;
	const data_critic = req.body.data_critic;
	const temporary = req.body.temporary;
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
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS' }));
});

app.get('/global_model_weights_actor', (req, res) => {
	console.log('Get global model weights (actor)');

	const file = createReadStream(process.cwd() + '/A3C_Data/global-model-actor/weights.bin');
	send(res, 206, file, { 'Content-Type': 'application/octet-stream' });
});

app.get('/global_model_actor', (req, res) => {
	console.log('Get global model weights (actor)');

	const file = createReadStream(process.cwd() + '/A3C_Data/global-model-actor/model.json');
	send(res, 206, file, { 'Content-Type': 'application/json' });
});

app.get('/global_model_weights_critic', (req, res, next) => {
	console.log('Get global model weights (critic)');

	const file = createReadStream(process.cwd() + '/A3C_Data/global-model-critic/weights.bin');
	send(res, 206, file, { 'Content-Type': 'application/octet-stream' });
});

app.get('/global_model_critic', (req, res, next) => {
	console.log('Get global model weights (critic)');

	const file = createReadStream(process.cwd() + '/A3C_Data/global-model-critic/model.json');
	send(res, 206, file, { 'Content-Type': 'application/json' });
});

app.post('/global_episode', async (req, res) => {
	console.log('Updating global moving average');
	let data = parseInt(await readFile(process.cwd() + '/A3C_Data/global_episode.txt', 'utf8'));
	data += 1;
	await writeFile(process.cwd() + '/A3C_Data/global_episode.txt', data.toString());
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS' }));
});

app.get('/global_episode', async (req, res) => {
	console.log('Get global moving average');
	const data = await readFile(process.cwd() + '/A3C_Data/global_episode.txt', 'utf8');
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS', data: data }));
});

app.post('/register_worker', async (req, res) => {
	console.log('Registering worker');
	const data = req.body.data;
	await appendFile(process.cwd() + '/A3C_Data/workers', '\n' + data.toString());
	// TODO: master.addWorker
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS' }));
});

/* TODO: add workers tokens table to sqllite3 db */
app.get('/worker_done', async (req, res) => {
	console.log('Poping token from workers list');
	const data = (await readFile(process.cwd() + '/A3C_Data/workers_tokens.txt', 'utf8'))
		.toString()
		.split('\n');
	if (data.length === 1 && data[0] === '') {
		res.writeHead(400, {
			'Content-Type': 'application/json'
		});
		res.end(JSON.stringify({ status: 'FAIL', data: 'NaN', err: 'No data in queue' }));
	}
	const elem_pop = data[0];
	let str = '';
	for (let i = 1; i < data.length; i++) {
		str += data[i] + '\n';
	}
	await writeFile(process.cwd() + '/A3C_Data/queue.txt', str);
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS', data: elem_pop }));
});

app.get('/workers_status', async (req, res) => {
	console.log('Checking workers status');
	const workers = (await readFile(process.cwd() + '/A3C_Data/workers_tokens.txt', 'utf8'))
		.toString()
		.split('\n');

	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	if (workers.length === 1 && workers[0] === '') {
		res.end(JSON.stringify({ status: 'SUCCESS', data: 'done' }));
	} else {
		res.end(JSON.stringify({ status: 'SUCCESS', data: workers.length }));
	}
});

app.get('/worker_started', async (req, res) => {
	console.log('Appending token to workers list');
	await appendFile(process.cwd() + '/A3C_Data/workers_tokens.txt', '1\n');
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS' }));
});

app.listen(port, () => {
	console.log(`> Running on http://localhost:${port}`);
});
