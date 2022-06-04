import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { createDeepQNetwork, copyWeights } from '../src/DQN';
import { train, randomUniform } from '@tensorflow/tfjs';

const DQNTest = suite('DQNTest');
const dimensions = [9, 9, 1];
const numActions = 4;

DQNTest('createDeepQNetwork', () => {
	const [d1, d2, d3] = dimensions;
	const model = createDeepQNetwork(d1, d2, d3, numActions);
	assert.is(model.inputs.length, 1);
	assert.equal(model.inputs[0].shape, [null, 9, 9, 1]);
	assert.is(model.outputs.length, 1);
	assert.equal(model.outputs[0].shape, [null, numActions]);
});

DQNTest('Invalid dim1, dim2, and/or dim3 leads to Error', () => {
	assert.throws(() => createDeepQNetwork(0, 10, 10, 4), /dim1/);
	assert.throws(() => createDeepQNetwork('10' as unknown as number, 10, 10, 4), /dim1/);
	assert.throws(() => createDeepQNetwork(null, 10, 10, 4), /dim1/);
	assert.throws(() => createDeepQNetwork(undefined, 10, 10, 4), /dim1/);
	assert.throws(() => createDeepQNetwork(10.8, 10, 10, 4), /dim1/);
	assert.throws(() => createDeepQNetwork(10, 0, 10, 4), /dim2/);
	assert.throws(() => createDeepQNetwork(10, '10' as unknown as number, 10, 4), /dim2/);
	assert.throws(() => createDeepQNetwork(10, null, 10, 4), /dim2/);
	assert.throws(() => createDeepQNetwork(10, undefined, 10, 4), /dim2/);
	assert.throws(() => createDeepQNetwork(10, 10.8, 10, 4), /dim2/);

	assert.throws(() => createDeepQNetwork(10, 10, 0, 4), /dim3/);
	assert.throws(() => createDeepQNetwork(10, 10, '10' as unknown as number, 4), /dim3/);
	assert.throws(() => createDeepQNetwork(10, 10, null, 4), /dim3/);
	assert.throws(() => createDeepQNetwork(10, 10, undefined, 4), /dim3/);
	assert.throws(() => createDeepQNetwork(10, 10, 10.8, 4), /dim3/);
});

DQNTest('Invalid numActions leads to Error', () => {
	assert.throws(() => createDeepQNetwork(10, 10, 10, 0), /numActions/);
	assert.throws(() => createDeepQNetwork(10, 10, 10, 1), /numActions/);
	assert.throws(() => createDeepQNetwork(10, 10, 10, '4' as unknown as number), /numActions/);
	assert.throws(() => createDeepQNetwork(10, 10, 10, null), /numActions/);
	assert.throws(() => createDeepQNetwork(10, 10, 10, undefined), /numActions/);
});

// DQNTest.run();

const CopyWeightsTest = suite('CopyWeightsTest');

CopyWeightsTest('copyWeights', async () => {
	const d1 = 9;
	const d2 = 9;
	const d3 = 1;
	const numActions = 4;
	const onlineNetwork = createDeepQNetwork(d1, d2, d3, numActions);
	const targetNetwork = createDeepQNetwork(d1, d2, d3, numActions);
	onlineNetwork.compile({
		loss: 'meanSquaredError',
		optimizer: train.sgd(0.1)
	});

	/* Initially, the two networks should have different values in their weights */
	const conv1Weights0 = onlineNetwork.layers[0].getWeights();
	const conv1Weights1 = targetNetwork.layers[0].getWeights();
	assert.is(conv1Weights0.length, conv1Weights1.length);

	/* The 1st weight is the 1st conv layer's kernel */
	assert.is(conv1Weights0[0].sub(conv1Weights1[0]).abs().mean().arraySync() > 0, true);

	const conv2Weights0 = onlineNetwork.layers[2].getWeights();
	const conv2Weights1 = targetNetwork.layers[2].getWeights();
	/* The 1st weight is the 2nd conv layer's kernel */
	assert.is(conv2Weights0[0].sub(conv2Weights1[0]).abs().mean().arraySync() > 0, true);

	copyWeights(targetNetwork, onlineNetwork);

	/* After the copying, all the weights should be equal between the two networks */
	const onlineWeights1 = onlineNetwork.getWeights();
	const targetWeights1 = targetNetwork.getWeights();
	assert.is(onlineWeights1.length, targetWeights1.length);
	let onlineWeights1Count = onlineWeights1.length;
	for (let i = 0; i < onlineWeights1Count; i++) {
		assert.is(onlineWeights1[i].sub(targetWeights1[i]).abs().mean().arraySync(), 0);
	}

	/* Modifying source network weight should not change target network weight */
	const xs = randomUniform([4].concat(onlineNetwork.inputs[0].shape.slice(1)));
	const ys = randomUniform([4].concat(onlineNetwork.outputs[0].shape.slice(1)));
	await onlineNetwork.fit(xs, ys, { epochs: 1 });

	const onlineWeights2 = onlineNetwork.getWeights();
	const targetWeights2 = targetNetwork.getWeights();
	assert.is(onlineWeights2.length, targetWeights2.length);

	onlineWeights1Count = onlineWeights1.length;
	for (let i = 0; i < onlineWeights1Count; i++) {
		/**
		 * Verify that the target network's weights haven't changed from before,
		 * even though the online network's weights have
		 */
		assert.is(onlineWeights2[0].sub(targetWeights2[0]).abs().mean().arraySync() > 0, true);
		assert.is(targetWeights2[0].sub(targetWeights1[0]).abs().mean().arraySync(), 0);
	}
});

CopyWeightsTest('Copy from trainable source to untrainable dest works', () => {
	/* Covers https://github.com/tensorflow/tfjs/issues/1807 */
	const dim1 = 9;
	const dim2 = 9;
	const dim3 = 1;
	const numActions = 4;
	const srcNetwork = createDeepQNetwork(dim1, dim2, dim3, numActions);
	const destNetwork = createDeepQNetwork(dim1, dim2, dim3, numActions);

	destNetwork.trainable = false;
	copyWeights(destNetwork, srcNetwork);
	assert.is(destNetwork.trainable, false);
	assert.is(srcNetwork.trainable, true);
});

// CopyWeightsTest.run();
