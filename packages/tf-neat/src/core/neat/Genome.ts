import { NodeGene, NodeType } from './gene/Node';
import { CxnGene } from './gene/Connection';
import { seededRandom } from '../../utils';

let INNOVATION = 0;

export type MutationItem = {
	proba: number;
	mutation: () => void;
};

export class Genome {
	public nodes = new Map<number, NodeGene>();
	public cxns = new Map<number, CxnGene>();
	public fitness = 0;

	compatibilityDistance(gen2: Genome, c1 = 1, c2 = 1, c3 = 0.3) {
		const innovations1 = Array.from(this.cxns.keys());
		const innovations2 = Array.from(gen2.cxns.keys());

		const innovationsMax1 = Math.max(...innovations1);
		const innovationsMax2 = Math.max(...innovations2);
		const innoMax = Math.max(innovationsMax1, innovationsMax2);

		let excess = 0;
		let disjoint = 0;
		let averageWeightDiff = 0;
		let matching = 0;
		for (let i = 0; i <= innoMax; i++) {
			const gen1Has = this.cxns.has(i);
			const gen2Has = gen2.cxns.has(i);
			if ((i > innovationsMax1 && gen2Has) || (i > innovationsMax2 && gen1Has)) {
				excess++;
			} else if ((gen1Has && !gen2Has) || (!gen1Has && gen2Has)) {
				disjoint++;
			} else if (gen1Has && gen2Has && this.cxns.has(i)) {
				const tempCxn = this.cxns.get(i);
				const tempGen2Cxn = gen2.cxns.get(i);
				if (tempCxn !== undefined && tempGen2Cxn !== undefined) {
					averageWeightDiff += Math.abs(tempCxn.weight - tempGen2Cxn.weight);
					matching++;
				}
			}
		}

		/*
      console.log(innovations1)
      console.log(innovations2)
      console.log('Excess:', excess, 'Disjoint:', disjoint, 'Matching:', matching)
    */

		averageWeightDiff /= matching || 1;

		const N = Math.max(innovations1.length, innovations2.length);

		return (c1 * excess + c2 * disjoint) / N + c3 * averageWeightDiff;
	}

	crossover(gen2: Genome) {
		const child = new Genome();
		child.nodes = new Map(
			Array.from(this.nodes.entries()).map((entry) => [entry[0], entry[1].copy()])
		);

		for (const entry of this.cxns) {
			const innovation = entry[0];
			const con = entry[1];

			/* matching */
			const tempGen2Cxn = gen2.cxns.get(innovation);
			if (tempGen2Cxn !== undefined) {
				child.cxns.set(innovation, seededRandom() > 0.5 ? con.copy() : tempGen2Cxn.copy());
			} else {
				child.cxns.set(innovation, con.copy());
			}

			/* reactivate disabled */
			const tempChildCxns = child.cxns.get(innovation);
			if (tempChildCxns !== undefined) {
				if (!tempChildCxns.enabled && seededRandom() > 0.75) {
					tempChildCxns.enable();
				}
			}
		}

		return child;
	}

	mutate() {
		const rand = Math.random();
		let cumulProba = 0;
		let selectedMutation = this.weightMutation;

		const mutations: MutationItem[] = [];
		mutations.push({ proba: 0.33, mutation: this.addNodeMutation });
		mutations.push({ proba: 0.33, mutation: this.addConnectionMutation });
		mutations.push({ proba: 0.33, mutation: this.disableConnectionMutation });

		mutations.every((object) => {
			const proba = object.proba;
			const mutation = object.mutation;
			cumulProba += proba;
			if (rand < cumulProba) {
				selectedMutation = mutation;
				return false;
			}
			return true;
		});

		this.getNodes().forEach((node) => {
			Math.random() > 0.2 ? node.perturbBias() : node.resetBias();
		});
		// this.getNodes().forEach(node => { if (Math.random() > 0.2) node.perturbBias() })
		this.getConnections().forEach((con) => {
			if (Math.random() > 0.2) con.perturbWeight();
		});

		selectedMutation.call(this);
	}

	disableConnectionMutation() {
		this.getRandomCxn().disable();
	}

	biasMutation() {
		this.getRandomNode().perturbBias();
	}

	weightMutation() {
		this.getRandomCxn().perturbWeight();
	}

	addNodeMutation() {
		INNOVATION++;

		const disabledCon = this.getRandomCxn();
		disabledCon.disable();

		const node = new NodeGene(NodeType.HIDDEN, this.nodes.size);
		this.addNode(node);

		this.addConnection(disabledCon.inNodeId, node.id).weight = 1;
		this.addConnection(node.id, disabledCon.outNodeId).weight = disabledCon.weight;
	}

	addConnectionMutation() {
		let attempt = 0;
		const MAX_ATTEMPT = 100;
		while (attempt++ < MAX_ATTEMPT) {
			const inNode = this.getRandomNode();
			const acceptableNodes = this.getNodes().filter((node) => node.level >= inNode.level);

			if (acceptableNodes.length === 0) {
				continue;
			}

			const outNode = acceptableNodes[Math.floor(Math.random() * acceptableNodes.length)];

			if (inNode === outNode) {
				continue;
			}
			if (this.existConnection(inNode, outNode)) {
				continue;
			}
			if (outNode.type === NodeType.INPUT || inNode.type === NodeType.OUTPUT) {
				continue;
			}

			this.addConnection(inNode.id, outNode.id);
			return;
		}
		console.log('Add connection mutation failed :(');
	}

	addConnection(inNodeId, outNodeId, enabled = true) {
		const newCon = new CxnGene(inNodeId, outNodeId, enabled, INNOVATION++);
		this.cxns.set(newCon.innovation, newCon);
		const inNode = this.nodes.get(inNodeId);
		const outNode = this.nodes.get(outNodeId);

		if (inNode !== undefined && outNode !== undefined) {
			inNode.outCxnsId.push(newCon.innovation);
			outNode.inCxnsId.push(newCon.innovation);

			if (inNode.level >= outNode.level) {
				this.calculateNodeLevelRecur(outNode, inNode.level);
			}
		}

		return newCon;
	}

	addNode(node: NodeGene) {
		this.nodes.set(node.id, node);
	}

	private getRandomCxn() {
		const connections = this.getConnections();
		return connections[Math.floor(seededRandom() * connections.length)];
	}

	private getRandomNode() {
		return this.nodes.get(Math.floor(seededRandom() * this.nodes.size)) as NodeGene;
	}

	private calculateNodeLevelRecur(node, level) {
		level++;
		node.level = Math.max(node.level, level);

		for (const id of node.outConnectionsId) {
			const con = this.cxns.get(id);
			if (con !== undefined) {
				const childNode = this.nodes.get(con.outNodeId);
				this.calculateNodeLevelRecur(childNode, level);
			}
		}
	}

	private existConnection(nodeIn: NodeGene, nodeOut: NodeGene) {
		for (const conId of nodeIn.outCxnsId) {
			const tempCxn = this.cxns.get(conId);
			if (tempCxn !== undefined && tempCxn.outNodeId === nodeOut.id) {
				return true;
			}
		}
		return false;
	}

	getNodes() {
		return Array.from(this.nodes.values());
	}

	getConnections() {
		return Array.from(this.cxns.values());
	}

	copy() {
		const clone = new Genome();
		clone.nodes = new Map(
			Array.from(this.nodes.entries()).map((entry) => [entry[0], entry[1].copy()])
		);
		clone.cxns = new Map(
			Array.from(this.cxns.entries()).map((entry) => [entry[0], entry[1].copy()])
		);
		return clone;
	}
}
