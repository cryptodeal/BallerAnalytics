import { Hono } from 'hono';
import { db, addToGMADb, addToBestScoreDb, addToQueueDb, resetQueue, getQueue } from './db';
import { APIResponseStatus, GMA_TABLE, BEST_SCORE_TABLE, QUEUE_TABLE } from './const';

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
	const data = await (<{ GLOBAL_MOVING_AVERAGE: number }>(
		db.prepare(`SELECT * FROM ${GMA_TABLE}`).get()
	));
	return c.json({ status: APIResponseStatus.SUCCESS, data });
});

app.post('/best_score', async (c) => {
	console.log('Updating best_score');
	const { data } = await c.req.parseBody();
	/* only select first row */
	const exists = await db.prepare(`SELECT * FROM ${BEST_SCORE_TABLE}`).get();
	if (exists) {
		await db.exec(
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
		return c.json({ status: APIResponseStatus.FAIL, data: NaN, err: 'No data in queue' });
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
	const { data, temporary } = <{ data: number | string; temporary: any }>await c.req.parseBody();
	/* TODO: FIX BELOW
    if (temporary) {
      fs.writeFileSync(__dirname + '/temporary-global-model/weights.bin', data, 'binary');
    } else {
      fs.writeFileSync(__dirname + '/global-model/weights.bin', data, 'binary');
    }
  */
	return c.json({ status: APIResponseStatus.SUCCESS });
});
console.log(`Running at http://localhost:${port}`);

export default {
	port: process.env.PORT || 3000,
	fetch: app.fetch
};
