import { RestApiStatus } from './Server';

/* WS API Types */
export type WsApiData = {
	type: string;
};

export type WsInitWorker = WsApiData & {
	type: 'INIT';
	payload: {
		id: string;
		first?: boolean;
	};
};

export type WsRunWorker = WsApiData & {
	type: 'RUN';
};

export type WsInitDone = WsApiData & {
	type: 'INIT_DONE';
};

export type WsDone = WsApiData & {
	type: 'DONE';
};

/* REST API Types */
export type RestApiBase = {
	status: RestApiStatus;
};

export type RestApiBaseData = RestApiBase & {
	data: number;
};

export type RestApiStringData = RestApiBase & {
	data: string;
};

export type RestApiError = RestApiBase & {
	err?: string;
};

/* Types for Data Posted to API by Workers */
export type WorkerBaseData = {
	data: number;
};

export type WorkerBaseDataId = WorkerBaseData & WorkerBaseId;

export type WorkerModelData = {
	id: string;
	data_actor: Buffer;
	data_critic: Buffer;
	temporary: boolean;
};

export type WorkerBaseId = {
	id: string;
};
