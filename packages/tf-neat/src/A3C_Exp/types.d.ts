type WsApiData = {
	type: string;
};

export type WsApiStartWorker = WsApiData & {
	workerNum: number;
	id: string;
	first: boolean;
};
