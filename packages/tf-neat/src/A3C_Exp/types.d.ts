import { RestApiStatus } from './A3CServer';

/* generic utilites */
export type ParsedWeights = Array<
	| number
	| number[]
	| number[][]
	| number[][][]
	| number[][][][]
	| number[][][][][]
	| number[][][][][][]
>;

export type AgentWeights = { actor_weights: ParsedWeights; critic_weights: ParsedWeights };

/* WS API Types */
export type WsApiData = {
	type: string;
};

export type WsInitWorker = WsApiData & {
	type: 'INIT';
	payload: {
		id: string;
		first?: boolean;
		loadGlobal?: boolean;
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

export type WorkerWeights = {
	weights: ParsedWeights;
};

export type SharedAgentWeights = {
	actor: ParsedWeights;
	critic: ParsedWeights;
};

export type WorkerBaseDataId = WorkerBaseData & WorkerBaseId;

export type WorkerModelData = {
	data_actor: ParsedWeights;
	data_critic: ParsedWeights;
	temporary: boolean;
};

export type WorkerBaseId = {
	id: string;
};
