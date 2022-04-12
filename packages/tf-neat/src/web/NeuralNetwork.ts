import {
	sequential,
	layers,
	tidy,
	train,
	losses,
	tensor,
	util,
	loadLayersModel
} from '@tensorflow/tfjs';
import { BaseModel } from './BaseModel';
import { Player } from '../base/utils/Player';
import { ModelType } from '../base';
import type { BaseInputs } from '../base/types';
import type { Tensor, Rank } from '@tensorflow/tfjs';

export class NeuralNetwork extends BaseModel {
	public type = ModelType.NN;

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
