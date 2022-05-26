// Layer activation functions
import * as tfc from '@tensorflow/tfjs-core';
import { serialization, Tensor, tidy } from '@tensorflow/tfjs-core';
import * as K from './backend';

export abstract class Activation extends serialization.Serializable {
	abstract apply(tensor: Tensor, axis?: number): Tensor;
	getConfig(): serialization.ConfigDict {
		return {};
	}
}

export class HardSigmoid extends Activation {
	apply(x: Tensor): Tensor {
		return K.hardSigmoid(x);
	}
}
