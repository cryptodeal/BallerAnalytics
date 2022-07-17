import { Hono } from 'hono';
import { Database } from 'bun:sqlite';
import { APIResponseStatus, GMA_TABLE, BEST_SCORE_TABLE, QUEUE_TABLE } from './const';

const app = new Hono();
const DB_NAME = process.env.SQL_LITE_3_DB_NAME;
const db = new Database(DB_NAME + '.sqlite');

db.run(
	`CREATE TABLE ${GMA_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, GLOBAL_MOVING_AVERAGE INTEGER)`
);
db.run(
	`CREATE TABLE ${BEST_SCORE_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, BEST_SCORE INTEGER)`
);
db.run(`CREATE TABLE ${QUEUE_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, QUEUE TEXT)`);

/* DB Functions */
// await db.exec(`DROP TABLE IF EXISTS ${GMA_TABLE}`);
// await db.exec(`DROP TABLE IF EXISTS ${BEST_SCORE_TABLE}`);
// await db.exec(`DROP TABLE IF EXISTS ${QUEUE_TABLE}`);

const addToGMADb = db.prepare(`INSERT INTO ${GMA_TABLE} (GLOBAL_MOVING_AVERAGE) VALUES (?)`);
const addToBestScoreDb = db.prepare(`INSERT INTO ${BEST_SCORE_TABLE} (BEST_SCORE) VALUES (?)`);
const addToQueueDb = db.prepare(`INSERT INTO ${QUEUE_TABLE} (QUEUE) VALUES (?)`);
const port = process.env.PORT || 3000;

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
		db.exec(`UPDATE ${GMA_TABLE} SET GLOBAL_MOVING_AVERAGE = ${avg} WHERE id = ${exists.id}`);
	} else {
		// @ts-expect-error bun has some weirdness
		addToGMADb.run([avg]);
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
		db.exec(
			`UPDATE ${BEST_SCORE_TABLE} SET GLOBAL_MOVING_AVERAGE = ${data} WHERE id = ${exists.id}`
		);
	} else {
		// @ts-expect-error bun has some weirdness
		addToBestScoreDb.run([data]);
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

app.get('/create_queue', (c) => {
	// fs.closeSync(fs.openSync('queue.txt', 'w'));
	/* TODO: implement basic queue in SQLLite3 ?? */
	return c.json({ status: APIResponseStatus.SUCCESS });
});

app.post('/queue', async (c) => {
	console.log('Adding to queue');
	const { data: elem } = await c.req.parseBody();
	console.log('Queue :' + elem);
	/* TODO: write best_score to file or db; potentially sqlite3 ?? */
	if (elem !== '') {
		//fs.appendFileSync('queue.txt', elem.toString()+'\n');
	}

	// TODO: Verify whether this is best status code
	c.status(202);
	return c.json({ status: APIResponseStatus.SUCCESS });
});

app.get('queue', (c) => {
	/* TODO: read queue data from file or db; potentially sqlite3 ?? */
	const data = '';
	if (data.length === 1 && data[0] === '') {
		return c.json({ status: APIResponseStatus.FAIL, data: NaN, err: 'No data in queue' });
	}
	const elem_pop = data[0];
	let str = '';
	const length = data.length;
	for (let i = 1; i < length; i++) {
		if (data[i] != '') str += data[i] + '\n';
	}
	/* TODO: write queue data from file or db; potentially sqlite3 ?? */
	// fs.writeFileSync('queue.txt', str);
	return c.json({ status: APIResponseStatus.SUCCESS, data: elem_pop });
});

console.log(`Running at http://localhost:${port}`);

export default {
	port: process.env.PORT || 3000,
	fetch: app.fetch
};
