import { seededRandom } from '../../../utils';
import { NodeType } from '.';
import type { Tensor } from '@tensorflow/tfjs';
import { getRandomInt } from '../../../DQN/utils';

export type NodeGeneActivationId =
	| 'elu'
	| 'relu'
	| 'relu6'
	| 'selu'
	| 'softmax'
	| 'sigmoid'
	| 'softplus'
	| 'tanh';

export type NodeGeneConfig = {
	activation?: NodeGeneActivationId;
	bias?: number;
	units?: number;
};
export class NodeGene {
	public id: number;
	public type: NodeType;
	public bias = 0;
	public level = 0;
	public outCxnsId: Map<number, number> = new Map();
	public inCxnsId: Map<number, number> = new Map();
	public out!: Tensor;
	public activation?: NodeGeneActivationId = undefined;
	private units!: number;

	private activationOpts: (NodeGeneActivationId | undefined)[] = [
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
		if (config) {
			const { bias, activation, units } = config;
			this.bias = bias || 0;
			if (this.type === NodeType.HIDDEN && units) this.units = units;
			if (!activation) {
				switch (type) {
					case NodeType.INPUT:
						this.activation = undefined;
						break;
					case NodeType.HIDDEN:
						this.activation = this.activationOpts[getRandomInt(0, this.activationOpts.length)];
						break;
					case NodeType.OUTPUT:
						const tempActivations = this.activationOpts.splice(0);
						tempActivations.push('softmax');
						this.activation = tempActivations[getRandomInt(0, tempActivations.length)];
						break;
				}
			}
		}

		/* used by addCnxMutation to not generate cycle */
		this.level = 0;
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
		/* only output node can use softmax? */
		if (this.type === NodeType.OUTPUT) activationFx.push('softmax');
		this.activation = this.activationOpts[getRandomInt(0, activationFx.length)];
	}

	copy() {
		const clone = new NodeGene(this.type, this.id, {
			activation: this.activation,
			bias: this.bias
		});
		clone.level = this.level;
		clone.units = this.units;

		clone.outCxnsId = new Map(JSON.parse(JSON.stringify([...this.outCxnsId])));
		clone.inCxnsId = new Map(JSON.parse(JSON.stringify([...this.inCxnsId])));

		return clone;
	}
}
