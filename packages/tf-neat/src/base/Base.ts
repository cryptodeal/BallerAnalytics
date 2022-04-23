import { sequential, layers, tidy, train, losses, tensor, util } from '@tensorflow/tfjs-node';
import { writeFile } from 'fs';
import type { Player, BaseInputs } from '@balleranalytics/nba-api-ts';
import { getDateStr } from '../utils';
import type { IBaseConfig, RawData } from './types';
import type { Sequential, Tensor, Rank } from '@tensorflow/tfjs-node';
import { ModelType } from '.';

export class Base {
	public callbacks = {
		onEpochEnd: async (epoch: number, logs) => {
			const { val_loss, val_mse, mse, loss } = logs as unknown as {
				val_loss: number;
				val_mse: number;
				mse: number;
				loss: number;
			};
			this.val_mse.push(val_mse);
			this.val_loss.push(val_loss);
			this.mse.push(mse);
			this.loss.push(loss);
		}
	};
	public val_mse: number[] = [];
	public val_loss: number[] = [];
	public mse: number[] = [];
	public loss: number[] = [];
	public type = ModelType.BASE;
	public hiddenLayers!: number;
	public rawPlayerData!: Player[];
	public rawData: RawData = [];
	public batchSize: number;
	public epochs: number;
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

	constructor(config: IBaseConfig) {
		const { batchSize, epochs, tfvis } = config;

		/* model config */
		batchSize !== undefined ? (this.batchSize = batchSize) : (this.batchSize = 32);
		epochs !== undefined ? (this.epochs = epochs) : (this.epochs = 50);

		/* TODO: show tfvis plots? */
		tfvis !== undefined ? (this.tfvis = true) : (this.tfvis = false);
	}

	async addData(data: Player[]) {
		const tempPlayers = data.filter(
			(p) => p.playerBirthDate && p.playerData && Object.keys(p.playerData).length > 2
		);

		tempPlayers.map((p) => {
			if (Object.keys(p.playerData).length > 1) {
				p.processSznData();
				const rawDataLength = p.rawData.length;
				for (let i = 0; i < rawDataLength; i++) {
					this.rawData.push(p.rawData[i]);
				}
			}
		});

		writeFile(`${process.cwd()}/data/basic.json`, JSON.stringify(this.rawData), (err) => {
			if (err) {
				throw err;
			}
			console.log(`🟢  raw data saved!`);
		});
	}

	minMaxNormalizer = (tensor: Tensor, xMin: Tensor<Rank>, xMax: Tensor<Rank>) => {
		return tensor.sub(xMin).div(xMax.sub(xMin));
	};

	/* create a sequential model */
	createModel() {
		const model = sequential({
			layers: [
				layers.dense({ units: 1, inputShape: [22], useBias: true }),
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
			validationSplit: 0.1,
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
		const filePath = `${process.cwd()}/data/models/${this.type}/val_mse_${
			this.val_mse[this.val_mse.length - 1]
		}-${getDateStr()}`;
		return this.model.save('file://' + filePath).then(() => {
			writeFile(
				filePath + `/training.json`,
				JSON.stringify({
					val_mse: this.val_mse,
					val_loss: this.val_loss,
					mse: this.mse,
					loss: this.loss
				}),
				(err) => {
					if (err) {
						throw err;
					}
					console.log(`🟢  Model saved!`);
				}
			);
		});
	}

	async init(data: Player[]) {
		await this.addData(data);
		this.createModel();
		this.dataToTensors();
		await this.train();
		if (data && data.length) await this.saveModel();
	}
}
