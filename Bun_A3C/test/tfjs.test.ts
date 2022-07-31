import { it, expect, describe } from 'bun:test';
import { layers, sequential, train, losses } from '@tensorflow/tfjs-node';

describe('rndFloat zig native code', () => {
	const model = sequential();

	it('time to gen 1 million random float64 using zig', () => {
		model.add(
			layers.dense({
				inputShape: [9, 12],
				units: 6,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
		);

		model.add(layers.flatten());

		model.add(
			layers.dense({
				units: 5,
				activation: 'softmax',
				kernelInitializer: 'glorotUniform'
			})
		);

		model.summary();

		model.compile({
			optimizer: train.adam(1e-4),
			loss: losses.softmaxCrossEntropy
		});
		expect(model !== null).toBe(true);
	});
	console.log(model);
});
