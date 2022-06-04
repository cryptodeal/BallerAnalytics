import { array, type NDArray } from 'vectorious';
import { NNode } from './NNode';
import type { EdgeSingular, ElementDefinition } from 'cytoscape';

export type EdgeAttributes = Record<string, number | string | boolean> & {
	weight: number;
	recurrent: boolean;
	isTimeDelayed: boolean;
	trait?: string;
	params?: NDArray;
};

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

	static linkToCyJsEdge(link: Link): ElementDefinition {
		const attr: EdgeAttributes = {
			weight: link.cxnWeight,
			recurrent: link.isRecurrent,
			isTimeDelayed: link.isTimeDelayed
		};
		if (link.trait) attr.trait = link.trait.string();
		return {
			group: 'edges',
			data: {
				id: link.getCyJsID(),
				source: link.inNode.getCyJsID(),
				target: link.outNode.getCyJsID(),
				...attr
			}
		};
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
		link.initDeriveTrait(trait);
		return link;
	}

	/* creates a new link, copying params, but connecting to specified nodes */
	static newLinkCopy(l: Link, inputNode: NNode, outNode: NNode) {
		const link = new Link(l.cxnWeight, inputNode, outNode, l.isRecurrent);
		link.trait = l.trait;
		link.initDeriveTrait(l.trait);
		return link;
	}

	/**
	 * isEqualGenetically checks if this link is genetically
	 * identical to provided link; i.e. connects nodes w same
	 * IDs and has equal recurrent flag (both links represent the same Gene)
	 */
	static isEqualGenetically(e1: EdgeSingular, e2: EdgeSingular) {
		const sameSource = e1.data('source') == e2.data('source');
		const sameTarget = e1.data('target') == e2.data('target');
		const sameRecurrent = e1.data('recurrent') === e2.data('recurrent');
		return sameSource && sameTarget && sameRecurrent;
	}

	/* link methods */
	static string(e: EdgeSingular): string {
		return `[Link: (${e.data('source')} <-> ${e.data('target')}, weight: ${e
			.data('weight')
			.toFixed(5)}, recurrent: ${e.data('recurrent')}, time delayed: ${e.data('isTimeDelayed')}]`;
	}

	public initDeriveTrait(t?: any) {
		if (t !== null) {
			this.params = array({ length: t.params.length }).fill(0);
			for (const [i, p] of t.params) {
				this.params.set(i, p);
			}
		}
	}

	static deriveTrait(e: EdgeSingular, t?: any) {
		if (t !== null) {
			const params = array({ length: t.params.length }).fill(0);
			for (const [i, p] of t.params) {
				params.set(i, p);
			}
			e.data('params', params);
		}
	}
}
