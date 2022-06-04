import { NodeCollection } from 'cytoscape';
import { NNode } from '../network/NNode';

/* The innovation method type enum */
export enum InnovationType {
	/* the novelty will be introduced by new NN node */
	NewNode,
	/* the novelty will be introduced by new NN link */
	NewLink
}

/**
 * mutator type enum specifies a kind of mutation
 * of cxn weights between NN nodes
 */
export enum MutatorType {
	/* adds Gaussian noise to the weights */
	Gaussian,
	/* sets weights to numbers chosen from a Gaussian distribution */
	GoldGaussian
}

/**
 * utility to select trait with given
 * ID from provided Traits array
 */
export const traitWithId = (traitId: number, traits: any[]) => {
	const traitsCount = traits.length;
	if (traitId !== 0 && traitsCount) {
		for (let i = 0; i < traitsCount; i++) {
			if (traits[i].id === traitId) {
				return traits[i];
			}
		}
	}
};

/**
 * Utility to select NNode with given
 * ID from provided NNodes array
 */
export const nodeWithID = (nodeId: number | string, nodes: NodeCollection) => {
	const nodesCount = nodes.length;
	if (nodeId !== 0 && nodesCount) {
		for (let i = 0; i < nodesCount; i++) {
			if (nodes[i].id() === (typeof nodeId === 'string' ? nodeId : 'n' + nodeId)) {
				return nodes[i];
			}
		}
	}
};
