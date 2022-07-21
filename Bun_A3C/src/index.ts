import { Hono } from 'hono';
import { serveStatic } from 'hono/serve-static.bun';
import { db, addToGMADb, addToBestScoreDb, addToGlobalEpisodeDb, resetQueue } from './db';
import {
	APIResponseStatus,
	GMA_TABLE,
	BEST_SCORE_TABLE,
	QUEUE_TABLE,
	GLOBAL_EPISODE_TABLE,
	WORKER_TOKENS_TABLE
} from './const';
import { write } from 'bun';

const port = process.env.PORT || 3000;
const app = new Hono();

app.get('/', (c) => {
	c.status(200);
	return c.json({ message: 'WELCOME TO THE BALLERANALYTICS A3C RL API! :)' });
});

/* routes for A3C server */
app.post('/global_moving_average', async (c) => {
	console.log('Updating global moving average');
	const body = await c.req.parseBody();
	const { avg } = body.data;
	/* only select first row */
	const exists = await db.prepare(`SELECT * FROM ${GMA_TABLE}`).get();
	if (exists) {
		await db.exec(`UPDATE ${GMA_TABLE} SET GLOBAL_MOVING_AVERAGE = ${avg} WHERE id = ${exists.id}`);
	} else {
		await addToGMADb.run(avg);
	}
	c.status(202);
	return c.json({ status: APIResponseStatus.SUCCESS });
});

app.get('/global_moving_average', async (c) => {
	console.log('Get global moving average');
	/* only select first row */
	return c.json({
		status: APIResponseStatus.SUCCESS,
		data: <{ GLOBAL_MOVING_AVERAGE: number }>db.prepare(`SELECT * FROM ${GMA_TABLE}`).get()
	});
});

app.post('/best_score', async (c) => {
	console.log('Updating best_score');
	const { data } = await c.req.parseBody();
	/* only select first row */
	const exists = await db.prepare(`SELECT * FROM ${BEST_SCORE_TABLE}`).get();
	if (exists) {
		db.exec(
			`UPDATE ${BEST_SCORE_TABLE} SET GLOBAL_MOVING_AVERAGE = ${data} WHERE id = ${exists.id}`
		);
	} else {
		addToBestScoreDb.run(data);
	}
	// TODO: Verify whether this is best status code
	c.status(202);
	return c.json({ status: APIResponseStatus.SUCCESS });
});

app.get('/best_score', async (c) => {
	console.log('Get best score');
	/* select first and only row */
	const data = await (<{ BEST_SCORE: number }>(
		db.prepare(`SELECT * FROM ${BEST_SCORE_TABLE}`).get()
	));
	return c.json({ status: APIResponseStatus.SUCCESS, data });
});

/* TODO: Determine whether needed as queue is cleared/reset at start */
app.get('/create_queue', async (c) => {
	await resetQueue();
	return c.json({ status: APIResponseStatus.SUCCESS });
});

app.post('/queue', async (c) => {
	console.log('Adding to queue');
	const { data: elem } = <{ data: number | string }>await c.req.parseBody();
	console.log('Queue :' + elem);
	if (elem !== '') {
		/* get first and only row */
		const exists = <{ VALUE: string; id: number }>(
			await db.prepare(`SELECT * FROM ${QUEUE_TABLE}`).get()
		);
		let { VALUE } = exists;
		const { id } = exists;
		VALUE += elem.toString() + '\n';
		await db.exec(`UPDATE ${QUEUE_TABLE} SET VALUE = ${VALUE} WHERE id = ${id}`);
		// TODO: Verify whether this is best status code
		c.status(202);
		return c.json({ status: APIResponseStatus.SUCCESS });
	} else {
		c.status(400);
		return c.json({ status: APIResponseStatus.FAIL, message: `Invalid input; received "${elem}"` });
	}
});

app.get('/queue', async (c) => {
	/* get first and only row */
	const exists = <{ VALUE: string; id: number }>(
		await db.prepare(`SELECT * FROM ${QUEUE_TABLE}`).get()
	);
	const { VALUE, id } = exists;
	if (VALUE.length === 1 && VALUE[0] === '') {
		return c.json({ status: APIResponseStatus.FAIL, data: 'NaN', err: 'No data in queue' });
	}
	const elem_pop = VALUE[0];
	let str = '';
	const length = VALUE.length;
	for (let i = 1; i < length; i++) {
		if (VALUE[i] != '') str += VALUE[i] + '\n';
	}
	await db.exec(`UPDATE ${QUEUE_TABLE} SET VALUE = ${str} WHERE id = ${id}`);
	return c.json({ status: APIResponseStatus.SUCCESS, data: elem_pop });
});

app.post('/local_model_weights', async (c) => {
	console.log('Saving local model into global model...');
	const { data_actor, data_critic, temporary } = <
		{ data_actor: BinaryData; data_critic: BinaryData; temporary: any }
	>await c.req.parseBody();
	if (temporary) {
		write('/temporary-global-model-actor/weights.bin', new Blob([data_actor]));
		write('/temporary-global-model-critic/weights.bin', new Blob([data_critic]));
	} else {
		write('/global-model-actor/weights.bin', new Blob([data_actor]));
		write('/global-model-critic/weights.bin', new Blob([data_critic]));
	}

	c.status(200);
	return c.json({ status: APIResponseStatus.SUCCESS });
});

app.get('/global_model_weights_actor', serveStatic({ root: './global-model-actor/weights.bin' }));

app.get('/global_model_weights_actor', serveStatic({ root: './global-model-critic/weights.bin' }));

app.post('/global_episode', async (c) => {
	console.log('Updating global moving average');
	/* get first and only row */
	const exists = <{ GLOBAL_EPISODE: number; id: number }>(
		await db.prepare(`SELECT * FROM ${GLOBAL_EPISODE_TABLE}`).get()
	);
	let data: number;
	if (!exists) {
		addToGlobalEpisodeDb.run(1);
	} else {
		db.exec(
			`UPDATE ${GLOBAL_EPISODE_TABLE} SET GLOBAL_MOVING_AVERAGE = ${data} WHERE id = ${exists.id}`
		);
	}

	c.status(200);
	return c.json({ status: APIResponseStatus.SUCCESS });
});

app.get('/global_episode', async (c) => {
	console.log('Get global moving average');
	const { GLOBAL_EPISODE: data } = <{ GLOBAL_EPISODE: number; id: number }>(
		await db.prepare(`SELECT * FROM ${GLOBAL_EPISODE_TABLE}`).get()
	);

	c.status(200);
	return c.json({ status: APIResponseStatus.SUCCESS, data });
});

/* TODO: add workers tokens table to sqllite3 db */
app.get('/worker_done', async (c) => {
	console.log('Piping token from workers list');
	const { TOKEN } = <{ TOKEN: string }>(
		await db.prepare(`SELECT * FROM ${WORKER_TOKENS_TABLE}`).get()
	);
	if (TOKEN.length === 1 && TOKEN[0] === '') {
		return c.json({ status: APIResponseStatus.FAIL, err: 'No data in queue' });
	}
	const elem_pop = TOKEN[0];
	let str = '';
	const length = TOKEN.length;
	for (let i = 1; i < length; i++) {
		str += TOKEN[i] + '\n';
	}
	await db.exec(`UPDATE ${QUEUE_TABLE} SET VALUE = ${str} WHERE id = ${1}`);

	return c.json({ status: APIResponseStatus.SUCCESS, data: elem_pop });
});

app.get('/workers_status', async (c) => {
	console.log(`Checking workers status`);
	const { TOKEN: workers } = <{ TOKEN: string }>(
		(await db.prepare(`SELECT * FROM ${WORKER_TOKENS_TABLE}`).get()).split('\n')
	);
	if (workers.length === 1 && workers[0] === '') {
		return c.json({ status: APIResponseStatus.SUCCESS, data: 'done' });
	} else {
		return c.json({ status: APIResponseStatus.SUCCESS, data: workers.length });
	}
});

app.get('/worker_started', async (c) => {
	db.exec(`UPDATE ${WORKER_TOKENS_TABLE} SET VALUE = 1\n WHERE id = ${1}`);
	return c.json({ status: APIResponseStatus.SUCCESS });
});

console.log(`Running at http://localhost:${port}`);

export default {
	port: process.env.PORT || 3000,
	fetch: app.fetch
};
