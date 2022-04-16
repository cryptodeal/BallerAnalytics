import { Base } from './Base';
import { sequential, layers, tidy, train, tensor, tensor2d, scalar, util } from '@tensorflow/tfjs';
import { ModelType } from '.';
import type { Tensor, Rank } from '@tensorflow/tfjs';
import type { BaseInputs } from './types';

export class RNN extends Base {
	public type = ModelType.RNN;
	public hiddenLayers = 5;
	public epochs = 10;
	/* create a sequential model */
	createModel() {
		const input_layer_shape = 15;
		const input_layer_neurons = 100;

		const rnn_input_layer_features = 5;
		const rnn_input_layer_timesteps = input_layer_neurons / rnn_input_layer_features;

		const rnn_input_shape = [input_layer_shape, rnn_input_layer_timesteps];
		const rnn_output_neurons = 20;

		const output_layer_shape = rnn_output_neurons;
		const output_layer_neurons = 1;

		const model = sequential({
			layers: [
				layers.dense({
					units: input_layer_neurons,
					inputShape: [input_layer_shape]
				})
			]
		});

		// model.add(layers.reshape({ targetShape: rnn_input_shape }));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const lstmCells: any[] = [];
		for (let i = 0; i < this.hiddenLayers; i++) {
			const tempCell = layers.lstmCell({ units: rnn_output_neurons });
			lstmCells.push(tempCell);
		}
		model.add(
			layers.rnn({
				cell: lstmCells,
				inputShape: rnn_input_shape,
				returnSequences: false
			})
		);

		model.add(layers.dense({ units: output_layer_neurons, inputShape: [output_layer_shape] }));

		this.model = model;
	}

	dataToTensors() {
		console.log(this.rawPlayerData);
		const tensorData = tidy(() => {
			// shuffle raw data
			util.shuffle(this.rawPlayerData);

			// convert data to Tensors
			const inputs = this.rawPlayerData.map((d) => d.inputs);
			const labels = this.rawPlayerData.map((d) => d.labels);

			const inputTensor = tensor2d(inputs, [inputs.length, inputs[0].length]).div(scalar(10));
			const labelTensor = tensor2d(labels, [labels.length, 1])
				.reshape([labels.length, 1])
				.div(scalar(10));

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

	async train(learning_rate = 0.01) {
		const { inputs, labels } = this.tensorData;

		// prepare the model for training.
		this.model.compile({
			optimizer: train.adam(learning_rate),
			loss: 'meanSquaredError'
		});

		/* train the model */
		return await this.model.fit(inputs, labels, {
			batchSize: 15,
			epochs: this.epochs,
			validationSplit: 0.2,
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
}
