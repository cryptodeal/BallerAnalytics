import { Database } from 'bun:sqlite';
import { BEST_SCORE_TABLE, DB_NAME, GMA_TABLE, QUEUE_TABLE } from '../const';

export const db = new Database(DB_NAME + '.sqlite');

/* drop tables if they exist */
await db.exec(`DROP TABLE IF EXISTS ${GMA_TABLE}`);
await db.exec(`DROP TABLE IF EXISTS ${BEST_SCORE_TABLE}`);
await db.exec(`DROP TABLE IF EXISTS ${QUEUE_TABLE}`);

/* create tables */
await db.exec(
	`CREATE TABLE ${GMA_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, GLOBAL_MOVING_AVERAGE INTEGER)`
);
await db.exec(
	`CREATE TABLE ${BEST_SCORE_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, BEST_SCORE INTEGER)`
);
await db.exec(`CREATE TABLE ${QUEUE_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, VALUE TEXT)`);

/* create initial record valus */
await db.exec(`INSERT INTO ${GMA_TABLE} (GLOBAL_MOVING_AVERAGE) VALUES ($GLOBAL_MOVING_AVERAGE)`, {
	$GLOBAL_MOVING_AVERAGE: 0
});
await db.exec(`INSERT INTO ${BEST_SCORE_TABLE} (BEST_SCORE) VALUES ($BEST_SCORE)`, {
	$BEST_SCORE: 0
});
/* TODO: Verify no initial value needed for queue ??
  await db.exec(`INSERT INTO ${QUEUE_TABLE} (QUEUE) VALUES ($QUEUE)`, {
    $QUEUE: 0
  });
*/

/* Query Statement Helpers */
export const addToGMADb = db.prepare(`INSERT INTO ${GMA_TABLE} (GLOBAL_MOVING_AVERAGE) VALUES (?)`);
export const addToBestScoreDb = db.prepare(
	`INSERT INTO ${BEST_SCORE_TABLE} (BEST_SCORE) VALUES (?)`
);
export const addToQueueDb = db.prepare(`INSERT INTO ${QUEUE_TABLE} (VALUE, ORDER) VALUES (?)`);
export const getQueue = db.prepare(`SELECT * FROM ${QUEUE_TABLE}`);

/* utility functions */
export const resetQueue = async () => {
	await db.exec(`DROP TABLE IF EXISTS ${QUEUE_TABLE}`);
	await db.exec(`CREATE TABLE ${QUEUE_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, VALUE TEXT)`);
};
