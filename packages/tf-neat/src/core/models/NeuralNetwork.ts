import { tensor, randomNormal, tidy, clone } from '@tensorflow/tfjs';
import type { Tensor, TensorContainer } from '@tensorflow/tfjs';
/*
 *  Basic neural network; inspired by: https://github.com/llSourcell/Modeling_Evolution_with_TensorflowJS/blob/master/Docs/NeuroEvolution_nn.js.html
 *  and https://github.com/dionbeetson/neuroevolution-experiment/blob/master/js/ai/NeuralNetwork.js
 */
export class NeuralNetwork {
	public input_nodes: number;
	public hidden_nodes: number;
	public output_nodes: number;
	public input_weights: Tensor;
	public output_weights: Tensor;
	constructor(input_nodes, hidden_nodes, output_nodes) {
		// The number of inputs (eg: player y position, height of next block etc..)
		this.input_nodes = input_nodes;
		// Amount of hidden nodes within the Neural Network)
		this.hidden_nodes = hidden_nodes;
		// The amount of outputs, we will use 2 (will be needed for level 3)
		this.output_nodes = output_nodes;

		// Initialize random weights
		this.input_weights = randomNormal([this.input_nodes, this.hidden_nodes]);
		this.output_weights = randomNormal([this.hidden_nodes, this.output_nodes]);
	}

	/* input 1D array and feeds forward through network */
	predict(user_input: number[]) {
		let output;
		tidy(() => {
			const input_layer = tensor(user_input, [1, this.input_nodes]);
			const hidden_layer = input_layer.matMul(this.input_weights).sigmoid();
			const output_layer = hidden_layer.matMul(this.output_weights).sigmoid();
			output = output_layer.dataSync();
		});
		return output;
	}

	/* returns a new network with the same weights as original */
	clone(): NeuralNetwork {
		return tidy(() => {
			const cloned = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes);
			cloned.dispose();
			cloned.input_weights = clone(this.input_weights);
			cloned.output_weights = clone(this.output_weights);
			return cloned as unknown as TensorContainer;
		}) as unknown as NeuralNetwork;
	}

	/* Dispose the input and output weights from the memory */
	dispose() {
		this.input_weights.dispose();
		this.output_weights.dispose();
	}

	stringify() {
		const neuralNetworkToSave = {
			input_weights: this.input_weights.arraySync(),
			output_weights: this.output_weights.arraySync()
		};

		return JSON.stringify(neuralNetworkToSave);
	}

	save(key) {
		localStorage.setItem(key, this.stringify());
	}
}
