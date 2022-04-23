import type BaseInputs from '@balleranalytics/nba-api-ts';

export type BaseFeatures = number[];

export interface IBaseConfig {
	batchSize: number;
	epochs: number;
	learningRate?: number;
	callbacks?: {
		onEpochEnd: (epoch: number, logs: uknown) => Promise<void>;
	};
	tfvis?: boolean;
}

export interface IRawData {
	inputs: BaseInputs;
	labels: [number];
}

export type TfjsWasmConfig = {
	wasmSimdThreadedPath: string;
	wasmSimdPath: string;
	wasmPath: string;
};

export type RawData = IRawData[];
