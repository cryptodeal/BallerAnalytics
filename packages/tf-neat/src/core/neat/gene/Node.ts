import { seededRandom } from '../../../utils';
import { NodeType } from '.';
import type { Tensor } from '@tensorflow/tfjs';

export class NodeGene {
	public id: number;
	public type: NodeType;
	public bias = 0;
	public level = 0;
	public outCxnsId: number[] = [];
	public inCxnsId: number[] = [];
	public out!: Tensor;

	constructor(type: NodeType, id: number, bias?: number) {
		this.type = type;
		this.id = id;
		this.bias = bias || 0;

		/* used by addCnxMutation to not generate cycle */
		this.level = 0;

		this.outCxnsId = [];
		this.inCxnsId = [];
	}

	resetBias() {
		this.bias = 0;
	}

	perturbBias() {
		this.bias += seededRandom() * 2 - 1; // [-1, 1]
	}

	copy() {
		const clone = new NodeGene(this.type, this.id);
		clone.level = this.level;
		clone.bias = this.bias;

		clone.outCxnsId = this.outCxnsId.slice();
		clone.inCxnsId = this.inCxnsId.slice();

		return clone;
	}
}
