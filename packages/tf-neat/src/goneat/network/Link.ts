import Float64Array from '@stdlib/array/float64';
import { NNode } from './NNode';

export class Link {
	/* weight of cxn */
	public cxnWeight: number;
	/* NNode inputting into cxn */
	public inNode: NNode;
	/* NNode that cxn affects */
	public outNode: NNode;
	/* is cxn recurrent */
	public isRecurrent: boolean;
	/* is cxn time delayed */
	public isTimeDelayed = false;

	/* points to trait of params for genetic creation */
	public trait: any;
	/**
	 *   - LEARNING PARAMETERS:
	 * the following params are used in neurons that learn
	 * via habituation, sensitization, or Hebbian-type processes
	 */
	public params?: Float64Array;

	/**
	 * creates new link w specified weight, input and
	 * output neurons connected (recurrent if specified)
	 */
	constructor(weight: number, inputNode: NNode, outputNode: NNode, recurrent: boolean) {
		this.cxnWeight = weight;
		this.inNode = inputNode;
		this.outNode = outputNode;
		this.isRecurrent = recurrent;
	}

	/* creates new link w specified trait */
	static newLinkWithTrait(
		trait: any,
		weight: number,
		inputNode: NNode,
		outputNode: NNode,
		recurrent: boolean
	) {
		const link = new Link(weight, inputNode, outputNode, recurrent);
		link.trait = trait;
		// TODO: link.deriveTrait(trait);
		return link;
	}

	/* creates a new link, copying params, but connecting to specified nodes */
	static newLinkCopy(l: Link, inputNode: NNode, outNode: NNode) {
		const link = new Link(l.cxnWeight, inputNode, outNode, l.isRecurrent);
		link.trait = l.trait;
		// TODO: link.deriveTrait(l.trait)
		return link;
	}

	/**
	 * isEqualGenetically checks if this link is genetically
	 * identical to provided link; i.e. connects nodes w same
	 * IDs and has equal recurrent flag (both links represent the same Gene)
	 */
	public isEqualGenetically(ol: Link) {
		const sameInNode = this.inNode.id == ol.inNode.id;
		const sameOutNode = this.outNode.id == ol.outNode.id;
		const sameRecurrent = this.isRecurrent == ol.isRecurrent;
		return sameInNode && sameOutNode && sameRecurrent;
	}

	/* link methods */
	public string(): string {
		return `[Link: (${this.inNode} <-> ${this.outNode}), weight: ${this.cxnWeight.toFixed(
			3
		)}, recurrent: ${this.isRecurrent}, time delayed: ${this.isTimeDelayed}]`;
	}

	public idString(): string {
		return `${this.inNode.id}-${this.outNode.id}`;
	}

	public deriveTrait(t?: any) {
		if (t !== null) {
			this.params = new Float64Array(t.params.length);
			for (const [i, p] of t.params) {
				this.params[i] = p;
			}
		}
	}
}
