import { train as trainer, sequential, layers, node } from '@tensorflow/tfjs-node';
import { MovingAverager } from '../utils';
import type { Sequential, LayersModel } from '@tensorflow/tfjs-node';
import type { Agent } from './Agent';
import type { SummaryFileWriter } from '@tensorflow/tfjs-node/dist/tensorboard';

export const createDeepQNetwork = (
	dim1: number,
	dim2: number,
	dim3: number,
	numActions: number
): Sequential => {
	if (!(Number.isInteger(dim1) && dim1 > 0)) {
		throw new Error(`Expected dim1 to be a positive integer, but got ${dim1}`);
	}
	if (!(Number.isInteger(dim2) && dim2 > 0)) {
		throw new Error(`Expected dim2 to be a positive integer, but got ${dim2}`);
	}
	if (!(Number.isInteger(dim3) && dim3 > 0)) {
		throw new Error(`Expected dim3 to be a positive integer, but got ${dim3}`);
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
			inputShape: [dim1, dim2, dim3]
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
};

export async function train(
	agent: Agent,
	batchSize: number,
	gamma: number,
	learningRate: number,
	cumulativeRewardThreshold: number,
	maxNumFrames: number,
	syncEveryFrames: number,
	savePath: string,
	logDir: string
) {
	let summaryWriter: SummaryFileWriter | null = null;
	if (logDir != null) {
		summaryWriter = node.summaryFileWriter(logDir);
	}

	for (let i = 0; i < agent.replayBufferSize; i++) {
		agent.playStep();
	}

	// Moving averager: cumulative reward across 100 most recent 100 episodes.
	const rewardAverager100 = new MovingAverager(100);

	const optimizer = trainer.adam(learningRate);
	let tPrev = new Date().getTime();
	let frameCountPrev = agent.frameCount;
	let averageReward100Best = -Infinity;

	while (true) {
		agent.trainOnReplayBatch(batchSize, gamma, optimizer);
		const { cumulativeReward, done, milestone } = agent.playStep();
		if (done) {
			const t = new Date().getTime();
			const framesPerSecond = ((agent.frameCount - frameCountPrev) / (t - tPrev)) * 1e3;
			tPrev = t;
			frameCountPrev = agent.frameCount;

			rewardAverager100.append(cumulativeReward);
			const averageReward100 = rewardAverager100.average();

			console.log(
				`Frame #${agent.frameCount}: ` +
					`cumulative reward: ${cumulativeReward}, ` +
					`cumulativeReward100=${averageReward100.toFixed(1)}; ` +
					`(epsilon=${agent.epsilon.toFixed(3)}) ` +
					`(${framesPerSecond.toFixed(1)} frames/s)`
			);
			if (summaryWriter != null) {
				summaryWriter.scalar('cumulativeReward100', averageReward100, agent.frameCount);
				summaryWriter.scalar('epsilon', agent.epsilon, agent.frameCount);
				summaryWriter.scalar('framesPerSecond', framesPerSecond, agent.frameCount);
			}
			if (averageReward100 >= cumulativeRewardThreshold || agent.frameCount >= maxNumFrames) {
				/* TODO: Save online network */
				break;
			}

			if (averageReward100 > averageReward100Best) {
				averageReward100Best = averageReward100;
				if (savePath != null) {
					await agent.onlineNetwork.save(`file://${savePath}`);
					console.log(`Saved DQN to ${savePath}`);
				}
			}
		}
		if (agent.frameCount % syncEveryFrames === 0) {
			copyWeights(agent.targetNetwork, agent.onlineNetwork);
			console.log("Sync'ed weights from online network to target network");
		}
	}
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
	/* TODO: Remove the workaround once the underlying issue is fixed */
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
