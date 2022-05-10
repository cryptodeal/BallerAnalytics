import { nanoid } from 'nanoid';
import { seededRandom } from '../../../utils';

export class CxnGene {
	public id: string;
	public inNodeId: number;
	public outNodeId: number;
	public enabled: boolean;
	public innovation: number;
	public weight!: number;

	private MUTATION_POWER = 2;

	constructor(inNodeId: number, outNodeId: number, enabled: boolean, innovation: number) {
		this.id = nanoid();

		this.inNodeId = inNodeId;
		this.outNodeId = outNodeId;
		this.enabled = enabled;
		this.innovation = innovation;
		this.resetWeight();
	}

	perturbWeight() {
		this.weight += (seededRandom() * 2 - 1) * this.MUTATION_POWER; // [-MUTATION_POWER, MUTATION_POWER]
	}

	private resetWeight() {
		this.weight = seededRandom() * 2 - 1;
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	copy() {
		const clone = new CxnGene(this.inNodeId, this.outNodeId, this.enabled, this.innovation);
		clone.weight = this.weight;
		return clone;
	}
}
