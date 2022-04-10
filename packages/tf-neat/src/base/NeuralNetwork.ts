import { Base } from './Base';
import { sequential, layers, tidy, train, losses, tensor } from '@tensorflow/tfjs-node';
import type { Tensor, Rank } from '@tensorflow/tfjs-node';
import type { BaseInputs } from './types';

export class NeuralNetwork extends Base {
	/* create a sequential model */
	createModel() {
		const model = sequential({
			layers: [
				layers.dense({ units: 15, inputShape: [15], activation: 'sigmoid' }),
				layers.dense({ units: 100, inputShape: [15], activation: 'relu' }),
				layers.dense({ units: 100, activation: 'relu' }),
				layers.dense({ units: 100, activation: 'relu' }),
				layers.dense({ units: 1, activation: 'softsign' })
			]
		});

		this.model = model;
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
			validationSplit: 0.2,
			batchSize: this.batchSize,
			shuffle: true
			// callbacks: callbacks
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

	async init(year: number) {
		await this.getData(year);
		this.createModel();
		this.dataToTensors();
		await this.train();
	}
}
