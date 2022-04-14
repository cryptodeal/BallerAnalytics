import { writable } from 'svelte/store';
import { resolve } from '$lib/functions/helpers';
import type { TFJSTrainingData, TFJSEpochData, GraphData } from './types';

export const tfjs = writable<TFJSTrainingData>({
	val_mse: [],
	val_loss: [],
	mse: [],
	loss: []
});

export class TrainingData {
	public subscribe;
	private _update;
	constructor() {
		const { subscribe, update } = tfjs;
		this.subscribe = subscribe;
		this._update = update;
	}

	public addEpochResults(epoch: number, res: TFJSEpochData) {
		this._update((d: TFJSTrainingData) => {
			const { val_loss, val_mse, mse, loss } = res;
			d.val_mse.push({ x: epoch, y: val_mse });
			d.val_loss.push({ x: epoch, y: val_loss });
			d.mse.push({ x: epoch, y: mse });
			d.loss.push({ x: epoch, y: loss });
		});
	}

	public resetTrainingData() {
		this._update((d: TFJSTrainingData) => {
			d.val_mse.splice(0);
			d.val_loss.splice(0);
			d.mse.splice(0);
			d.loss.splice(0);
		});
	}

	public getData(path: string): GraphData {
		return resolve(path, this.subscribe());
	}
}
