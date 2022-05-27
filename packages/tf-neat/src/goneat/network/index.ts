import { NNode } from './NNode';
import Float64Array from '@stdlib/array/float64';

export enum NodeType {
	NeuronNode = 'NEURON',
	SensorNode = 'SENSOR',
	Default = 'UNKNOWN NODE TYPE'
}

export enum NeuronType {
	HIDDEN = 'HIDDEN',
	INPUT = 'INPUT',
	OUTPUT = 'OUTPUT',
	BIAS = 'BIAS'
}

export const activateNode = (node: NNode, a: any) => {
	const out = a.activateByType(node.activationSum, node.params, node.activationType);
	// TODO: node.setActivation(out);
};

export const activateModule = (module: NNode, a: any) => {
	const inputs = new Float64Array(module.inCxns.size);

	for (const [i, v] of module.inCxns) {
		inputs[i] = v.inNode.getActiveOut();
	}

	const outputs = a.activateModuleByType(inputs, module.params, module.activationType);
	if (outputs.length !== module.outCxns.size) {
		throw new Error(
			`number of output params ${outputs.length} !== number of output neurons of the module ${module.outCxns.size}`
		);
	}

	/* set outputs */
	for (const [i, out] of outputs.length) {
		module.outCxns[i].outNode.setActivation(out);
	}
};
