import { writable } from 'svelte/store';
import type { TFJSTrainingData } from './types';

export const trainingData = writable<TFJSTrainingData>({
	val_mse: [],
	val_loss: [],
	mse: [],
	loss: []
});
