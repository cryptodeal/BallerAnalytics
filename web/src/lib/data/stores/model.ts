import { readable } from 'svelte/store';
import { trainingData } from './trainingData';
import { browser } from '$app/environment';
import { NeuralNetwork } from '@balleranalytics/tf-neat';
import wasmSimdPath from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-simd.wasm?url';
import wasmSimdThreadedPath from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-threaded-simd.wasm?url';
import wasmPath from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm?url';

export const tfjs = readable<NeuralNetwork | undefined>(undefined, (set) => {
	if (!browser) return undefined;

	const model = new NeuralNetwork(
		{
			wasmSimdPath,
			wasmSimdThreadedPath,
			wasmPath
		},
		{
			epochs: 100,
			batchSize: 20,
			callbacks: {
				onEpochEnd: async (epoch, logs) => {
					if (epoch === 0) {
						trainingData.set({
							val_mse: [],
							val_loss: [],
							mse: [],
							loss: []
						});
					}
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
		}
	);
	set(model);

	return () => {
		model.dispose();
	};
});
