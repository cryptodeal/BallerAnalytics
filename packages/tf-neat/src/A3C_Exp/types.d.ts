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
