export enum APIResponseStatus {
	SUCCESS,
	FAIL
}
export const DB_NAME = process.env.SQL_LITE_3_DB_NAME;
export const GMA_TABLE = `${DB_NAME}_GMA`;
export const QUEUE_TABLE = `${DB_NAME}_QUEUE`;
export const BEST_SCORE_TABLE = `${DB_NAME}_BEST_SCORE`;
export const GLOBAL_EPISODE_TABLE = `${DB_NAME}_GLOBAL_EPISODE`;
