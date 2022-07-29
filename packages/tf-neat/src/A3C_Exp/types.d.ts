type WsApiData = {
	type: string;
};

export type WsApiStartWorker = WsApiData & {
	workerNum: number;
};
