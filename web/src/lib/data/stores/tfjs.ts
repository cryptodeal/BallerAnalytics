import { readable, writable } from 'svelte/store';
import { browser } from '$app/env';
import { NeuralNetwork } from '@balleranalytics/tf-neat';
import type { TFJSTrainingData } from './types';

export const trainingData = writable<TFJSTrainingData>({
	val_mse: [],
	val_loss: [],
	mse: [],
	loss: []
});

export const tfjs = readable<NeuralNetwork>(new NeuralNetwork(), (set) => {
	if (!browser) return;

	const model = new NeuralNetwork({
		epochs: 100,
		batchSize: 5,
		callbacks: {
			onEpochEnd: async (epoch, logs) => {
				trainingData.update((d) => {
					const { val_loss, val_mse, mse, loss } = logs;
					d.val_mse.push({ x: epoch, y: val_mse });
					d.val_loss.push({ x: epoch, y: val_loss });
					d.mse.push({ x: epoch, y: mse });
					d.loss.push({ x: epoch, y: loss });
					return d;
				});
			}
		}
	});
	set(model);

	return () => {
		model.dispose();
	};
});
