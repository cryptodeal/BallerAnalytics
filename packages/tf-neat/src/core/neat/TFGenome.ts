import { tensor, tidy, scalar, sigmoid, Scalar, type Tensor } from '@tensorflow/tfjs-node';
import type { CxnGene } from './gene/Connection';
import type { NodeGene } from './gene/Node';
import type { Genome } from './Genome';

export class TFGenome {
	static toTFGraph(genome: Genome, inputs) {
		return tidy(() => {
			let nodes = genome.getNodes();
			const inputNodes = nodes.filter((node) => node.type === 'INPUT');
			const outputsNodes = nodes.filter((node) => node.type === 'OUTPUT');
			nodes = nodes.filter((node) => node.type !== 'INPUT');

			if (inputs.length !== inputNodes.length) {
				throw new Error('mismatch inputs length' + inputs.length + ' vs ' + inputNodes.length);
			}

			for (let i = 0; i < inputNodes.length; i++) {
				inputNodes[i].out = tensor(inputs[i]);
			}

			nodes.sort((a, b) => a.level - b.level);

			for (const node of nodes) {
				let out: Tensor | Scalar = scalar(0);
				for (const conId of node.inCxnsId) {
					const con = genome.cxns.get(conId);
					if (con !== undefined && !con.enabled) {
						continue;
					}
					const inNode = genome.nodes.get((con as CxnGene).inNodeId);

					out = out.add(scalar((con as CxnGene).weight).mul((inNode as NodeGene).out));
				}
				out = sigmoid(out.add(scalar(node.bias)));
				node.out = out;
			}

			return outputsNodes.map((node) => node.out);
		});
	}
}
