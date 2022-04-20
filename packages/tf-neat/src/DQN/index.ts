import { sequential, layers } from '@tensorflow/tfjs';
import { Sequential, LayersModel } from '@tensorflow/tfjs';

export function createDeepQNetwork(h: number, w: number, numActions: number): Sequential {
	if (!(Number.isInteger(h) && h > 0)) {
		throw new Error(`Expected height to be a positive integer, but got ${h}`);
	}
	if (!(Number.isInteger(w) && w > 0)) {
		throw new Error(`Expected width to be a positive integer, but got ${w}`);
	}
	if (!(Number.isInteger(numActions) && numActions > 1)) {
		throw new Error(
			`Expected numActions to be a integer greater than 1, ` + `but got ${numActions}`
		);
	}

	const model = sequential();
	model.add(
		layers.conv2d({
			filters: 128,
			kernelSize: 3,
			strides: 1,
			activation: 'relu',
			inputShape: [h, w, 2]
		})
	);
	model.add(layers.batchNormalization());
	model.add(
		layers.conv2d({
			filters: 256,
			kernelSize: 3,
			strides: 1,
			activation: 'relu'
		})
	);
	model.add(layers.batchNormalization());
	model.add(
		layers.conv2d({
			filters: 256,
			kernelSize: 3,
			strides: 1,
			activation: 'relu'
		})
	);
	model.add(layers.flatten());
	model.add(layers.dense({ units: 100, activation: 'relu' }));
	model.add(layers.dropout({ rate: 0.25 }));
	model.add(layers.dense({ units: numActions }));

	return model;
}

/**
 * Copy the weights from a source deep-Q network to another.
 *
 * destNetwork: The destination network of weight copying.
 * srcNetwork: The source network for weight copying.
 */
export function copyWeights(destNetwork: LayersModel, srcNetwork: LayersModel) {
	// https://github.com/tensorflow/tfjs/issues/1807:
	// Weight orders are inconsistent when the trainable attribute doesn't
	// match between two `LayersModel`s. The following is a workaround.
	// TODO(cais): Remove the workaround once the underlying issue is fixed.
	let originalDestNetworkTrainable;
	if (destNetwork.trainable !== srcNetwork.trainable) {
		originalDestNetworkTrainable = destNetwork.trainable;
		destNetwork.trainable = srcNetwork.trainable;
	}

	destNetwork.setWeights(srcNetwork.getWeights());

	// Weight orders are inconsistent when the trainable attribute doesn't
	// match between two `LayersModel`s. The following is a workaround.
	// TODO(cais): Remove the workaround once the underlying issue is fixed.
	// `originalDestNetworkTrainable` is null if and only if the `trainable`
	// properties of the two LayersModel instances are the same to begin
	// with, in which case nothing needs to be done below.
	if (originalDestNetworkTrainable != null) {
		destNetwork.trainable = originalDestNetworkTrainable;
	}
}
