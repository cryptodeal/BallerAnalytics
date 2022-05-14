import { seededRandom } from '../../../utils';
import { NodeType } from '.';
import type { Tensor } from '@tensorflow/tfjs';
import type { ActivationIdentifier } from '@tensorflow/tfjs-layers/dist/keras_format/activation_config';
import { getRandomInt } from '../../../DQN/utils';

export type NodeGeneConfig = {
	activation?: ActivationIdentifier;
	bias?: number;
	units?: number;
};
export class NodeGene {
	public id: number;
	public type: NodeType;
	public bias = 0;
	public level = 0;
	public outCxnsId: number[] = [];
	public inCxnsId: number[] = [];
	public out!: Tensor;
	public activation?: ActivationIdentifier;
	private units!: number;

	private activationOpts: (ActivationIdentifier | undefined)[] = [
		'elu',
		'relu',
		'relu6',
		'selu',
		'sigmoid',
		'softplus',
		'tanh'
	];

	constructor(type: NodeType, id: number, config?: NodeGeneConfig) {
		this.type = type;
		this.id = id;
		const { bias, activation, units } = config || {};
		this.activation = activation || 'sigmoid';
		this.bias = bias || 0;

		if (this.type === NodeType.HIDDEN && units) this.units = units;
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

	resetActivation() {
		this.activation = 'sigmoid';
	}

	perturbActivation() {
		const activationFx = this.activationOpts.slice();
		if (this.type === NodeType.OUTPUT) activationFx.push('softmax');
		this.activation = this.activationOpts[getRandomInt(0, activationFx.length)];
	}

	copy() {
		const clone = new NodeGene(this.type, this.id);
		clone.level = this.level;
		clone.bias = this.bias;
		clone.activation = this.activation;
		clone.units = this.units;

		clone.outCxnsId = this.outCxnsId.slice();
		clone.inCxnsId = this.inCxnsId.slice();

		return clone;
	}
}
