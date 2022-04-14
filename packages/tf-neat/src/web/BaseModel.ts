import {
	disposeVariables,
	sequential,
	layers,
	tidy,
	train,
	losses,
	tensor,
	util,
	loadLayersModel
} from '../../tfjs-custom/custom_tfjs.js';
import { getDateStr } from '../utils';
import { ModelType } from '../base';
import type { IBaseConfig, BaseInputs, RawData } from '../base/types';
import type { Sequential, Tensor, Rank } from '../../tfjs-custom/custom_tfjs.js';

export class BaseModel {
	public val_mse: { x: number; y: number }[] = [];
	public val_loss: { x: number; y: number }[] = [];
	public mse: { x: number; y: number }[] = [];
	public loss: { x: number; y: number }[] = [];
	public callbacks = {
		onEpochEnd: async (epoch: number, logs) => {
			const { val_loss, val_mse, mse, loss } = logs as unknown as {
				val_loss: number;
				val_mse: number;
				mse: number;
				loss: number;
			};
			this.val_mse.push({ x: epoch, y: val_mse });
			this.val_loss.push({ x: epoch, y: val_loss });
			this.mse.push({ x: epoch, y: mse });
			this.loss.push({ x: epoch, y: loss });
		}
	};
	public type = ModelType.BASE;
	public hiddenLayers!: number;
	public rawData: RawData = [];
	public batchSize = 100;
	public epochs = 10;
	public tfvis = false;
	public model!: Sequential;
	public tensorData!: {
		inputs: Tensor<Rank>;
		labels: Tensor<Rank>;
		inputMax: Tensor<Rank>;
		inputMin: Tensor<Rank>;
		labelMax: Tensor<Rank>;
		labelMin: Tensor<Rank>;
	};

	constructor(config?: IBaseConfig) {
		if (config) {
			const { batchSize, epochs, callbacks } = config;

			/* model config */
			if (batchSize) this.batchSize = batchSize;
			if (epochs) this.epochs = epochs;
			if (callbacks) this.callbacks = callbacks;
		}
	}

	loadData(data: RawData) {
		this.rawData = data;
	}

	minMaxNormalizer = (tensor: Tensor, xMin: Tensor<Rank>, xMax: Tensor<Rank>) => {
		return tensor.sub(xMin).div(xMax.sub(xMin));
	};

	/* create a sequential model */
	createModel() {
		const model = sequential({
			layers: [
				layers.dense({ units: 1, inputShape: [15], useBias: true }),
				layers.dense({ units: 1, useBias: true })
			]
		});
		this.model = model;
	}

	dataToTensors() {
		const tensorData = tidy(() => {
			function shuffleFmtData(rawData: RawData) {
				/*
          shuffle raw data input/label pairs;
          type: { inputs: BaseInputs; labels: [number] }[]
        */
				util.shuffle(rawData);

				/* prep data for training */
				const inputs: BaseInputs[] = [];
				const labels: [number][] = [];
				rawData.map(({ inputs: i, labels: l }) => {
					inputs.push(i);
					labels.push(l);
				});

				return { inputs, labels };
			}

			const { inputs, labels } = shuffleFmtData(this.rawData);

			// convert data to Tensors
			const inputTensor = tensor(inputs);
			const labelTensor = tensor(labels);

			// normalize the data to the range 0 - 1 using min-max scaling
			const inputMax = inputTensor.max();
			const inputMin = inputTensor.min();
			const labelMax = labelTensor.max();
			const labelMin = labelTensor.min();

			const normalizedInputs = this.minMaxNormalizer(inputTensor, inputMin, inputMax);

			return {
				inputs: normalizedInputs,
				labels: labelTensor,
				inputMax,
				inputMin,
				labelMax,
				labelMin
			};
		});

		this.tensorData = tensorData;
	}

	async train() {
		const { inputs, labels } = this.tensorData;

		/* prepare the model for training */
		this.model.compile({
			optimizer: train.adam(),
			loss: losses.meanSquaredError,
			metrics: ['mse']
		});

		/* train model */
		return await this.model.fit(inputs, labels, {
			epochs: this.epochs,
			validationSplit: 0.25,
			batchSize: this.batchSize,
			shuffle: true,
			callbacks: this.callbacks
		});
	}

	predict(inputData: BaseInputs) {
		const { inputMin, inputMax } = this.tensorData;

		const preds = tidy(() => {
			const predictTensor = this.minMaxNormalizer(tensor([inputData]), inputMin, inputMax);

			/* feed inputData inputs to make the predictions */
			const preds = this.model.predict(predictTensor) as Tensor<Rank>;
			return preds.dataSync();
		});

		return preds[0];
	}

	saveModel() {
		return this.model
			.save(
				`file://${process.cwd()}/data/models/${this.type}/val_mse_${
					this.val_mse[this.val_mse.length - 1]
				}-${getDateStr()}`
			)
			.then(() => console.log(`🟢  Model saved!`));
	}

	async loadModel(path: string) {
		this.model = (await loadLayersModel(path)) as Sequential;
	}

	async init(data: RawData) {
		this.loadData(data);
		this.createModel();
		this.dataToTensors();
		await this.train();
	}

	dispose() {
		this.model.dispose();
		disposeVariables();
	}
}
