import {
	elu,
	tensor,
	tidy,
	scalar,
	sigmoid,
	Scalar,
	type Tensor,
	relu,
	relu6,
	softmax,
	selu,
	softplus,
	tanh
} from '@tensorflow/tfjs';
import { NodeType } from './gene';
import type { CxnGene } from './gene/Connection';
import type { NodeGene } from './gene/Node';
import type { Genome } from './Genome';

export class TFGenome {
	static toTFGraph(genome: Genome, inputs: number[][]) {
		return tidy(() => {
			let nodes = genome.getNodes();
			const inputNodes = nodes.filter((node) => node.type === NodeType.INPUT);
			const outputsNodes = nodes.filter((node) => node.type === NodeType.OUTPUT);
			nodes = nodes.filter((node) => node.type !== NodeType.INPUT);

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
				/* enables neuroevolution of activation functions */
				switch (node.activation) {
					case 'elu':
						out = elu(out.add(scalar(node.bias)));
						break;
					case 'relu':
						out = relu(out.add(scalar(node.bias)));
						break;
					case 'relu6':
						out = relu6(out.add(scalar(node.bias)));
						break;
					case 'selu':
						out = selu(out.add(scalar(node.bias)));
						break;
					case 'sigmoid':
						out = sigmoid(out.add(scalar(node.bias)));
						break;
					case 'softplus':
						out = softplus(out.add(scalar(node.bias)));
						break;
					case 'softmax':
						out = softmax(out.add(scalar(node.bias)));
						break;
					case 'tanh':
						out = tanh(out.add(scalar(node.bias)));
						break;
				}
				node.out = out;
			}

			return outputsNodes.map((node) => node.out);
		});
	}
}