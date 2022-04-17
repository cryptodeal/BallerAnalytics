import { tidy, tensor, sequential, layers, train, losses } from '@tensorflow/tfjs';
import { BaseModel } from './BaseModel';
import { ModelType } from '../base';
import type { BaseInputs } from '../base/types';
import type { Tensor, Rank } from '@tensorflow/tfjs';

export class NeuralNetwork extends BaseModel {
	public type = ModelType.NN;
	/* create a sequential model */
	createModel() {
		const model = sequential({
			layers: [
				/* relu activated input layer w 15 neurons */
				layers.dense({ units: 100, inputShape: [15], activation: 'relu' }),
				/* sigmoid activation effective w 100 neurons on input layer */
				layers.dense({ units: 100, activation: 'relu' }),
				/* relu effective w 100 neuron dense layer */
				layers.dense({ units: 100, activation: 'relu' }),
				/* softplus tests effective on output layer */
				layers.dense({ units: 1, activation: 'relu' })
			]
		});

		this.model = model;
	}

	async train() {
		const { inputs, labels } = this.tensorData;

		/* prepare the model for training */
		this.model.compile({
			optimizer: train.adam(0.01),
			loss: losses.meanSquaredError,
			metrics: ['mse']
		});

		/* train model */
		return await this.model.fit(inputs, labels, {
			epochs: this.epochs,
			batchSize: this.batchSize,
			shuffle: true,
			validationSplit: 0.25,
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
}