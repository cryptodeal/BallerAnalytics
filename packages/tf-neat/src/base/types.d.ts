export type BaseFeatures = number[];

export interface IBaseConfig {
	batchSize: number;
	epochs: number;
	callbacks?: {
		onEpochEnd: (epoch: number, logs: uknown) => Promise<void>;
	};
	tfvis?: boolean;
}

export type BaseInputs = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number
];

export interface IRawData {
	inputs: BaseInputs;
	labels: [number];
}

export type RawData = IRawData[];
