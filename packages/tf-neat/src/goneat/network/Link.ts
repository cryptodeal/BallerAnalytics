import { array, type NDArray } from 'vectorious';
import { NNode } from './NNode';

export type LinkAttributes = 'weight' | 'recurrent' | 'parameters';

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
	public params?: NDArray;

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
	/* cytoscape helper methods */
	public getCyJsID() {
		return `${this.inNode.id}-${this.outNode.id}`;
	}

	/* graph implementation methods */

	/* returns from node of the edge */
	public from() {
		return this.inNode;
	}

	/* returns to node of the edge */
	public to() {
		return this.outNode;
	}

	/* returns weight of link */
	public weight() {
		return this.cxnWeight;
	}

	/**
	 * returns the edge reversal of the receiver
	 * if a reversal is valid for dataType; When
	 * a reversal is valid, an edge of same type as
	 * receiver with nodes of the receiver swapped
	 * should be returned unaltered.
	 */
	public reversedEdge() {
		/* reversal is invalid, so return unaltered */
		return this;
	}

	/**
	 * attributes returns list of standard attributes
	 * associated with graph edge
	 */
	public attributes() {
		const attr: Map<LinkAttributes, number | boolean | NDArray> = new Map();
		attr.set('weight', this.cxnWeight);
		attr.set('recurrent', this.isRecurrent);
		if (this.params?.length) attr.set('parameters', this.params);
		return attr;
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
		link.deriveTrait(trait);
		return link;
	}

	/* creates a new link, copying params, but connecting to specified nodes */
	static newLinkCopy(l: Link, inputNode: NNode, outNode: NNode) {
		const link = new Link(l.cxnWeight, inputNode, outNode, l.isRecurrent);
		link.trait = l.trait;
		link.deriveTrait(l.trait);
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
			this.params = array({ length: t.params.length }).fill(0);
			for (const [i, p] of t.params) {
				this.params.set(i, p);
			}
		}
	}
}
