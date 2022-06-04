import { NodeGene } from './gene/Node';
import { NodeType } from './gene';
import { CxnGene } from './gene/Connection';
import { seededRandom } from '../../utils';
import { getRandomInt } from '../../DQN/utils';

let INNOVATION = 0;

export type MutationItem = {
	proba: number;
	mutation: () => void;
};

export type MutationRates = {
	activation?: number;
	node?: number;
	cxn?: number;
	cxnWeight?: number;
	bias?: number;
};

export class Genome {
	public nodes = new Map<number, NodeGene>();
	public cxns = new Map<number, CxnGene>();
	public fitness = 0;
	private mutationRates = {
		activation: 0.2,
		node: 0.33,
		cxn: 0.33,
		cxnWeight: 0.2,
		bias: 0.2
	};
	public mutateBoost = false;
	private mutateBoostRates = {
		activation: 0.2,
		node: 0.33,
		cxn: 0.33,
		cxnWeight: 0.2,
		bias: 0.2
	};

	compatibilityDistance(gen2: Genome, c1 = 1, c2 = 1, c3 = 0.3) {
		/* TODO: activation functions should factor into speciation? */
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

		averageWeightDiff /= matching || 1;

		const N = Math.max(innovations1.length, innovations2.length);
		const compatibilityDistance = (c1 * excess + c2 * disjoint) / N + c3 * averageWeightDiff;

		/*
      console.log(innovations1)
      console.log(innovations2)
      console.log('Excess:', excess, 'Disjoint:', disjoint, 'Matching:', matching)
      console.log(compatibilityDistance)
    */

		return compatibilityDistance;
	}

	crossover(gen2: Genome) {
		const child = new Genome();
		child.setMutationRate(this.mutationRates);
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
		const rand = seededRandom();
		let cumulProba = 0;
		let selectedMutation = this.weightMutation;

		const mutations: MutationItem[] = [];
		mutations.push({
			proba: !this.mutateBoost ? this.mutationRates.node : this.mutateBoostRates.node,
			mutation: this.addNodeMutation
		});
		mutations.push({
			proba: !this.mutateBoost ? this.mutationRates.cxn : this.mutateBoostRates.cxn,
			mutation: this.addConnectionMutation
		});
		mutations.push({
			proba: !this.mutateBoost ? this.mutationRates.cxn : this.mutateBoostRates.cxn,
			mutation: this.disableConnectionMutation
		});

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
			if (
				seededRandom() > (!this.mutateBoost ? this.mutationRates.bias : this.mutateBoostRates.bias)
			) {
				node.perturbBias();
			} else {
				node.resetBias();
			}

			/* input nodes shouldn't have activation function */
			if (
				node.type !== NodeType.INPUT &&
				seededRandom() >
					(!this.mutateBoost ? this.mutationRates.activation : this.mutateBoostRates.activation)
			) {
				node.perturbActivation();
			}
		});

		this.getConnections().forEach((con) => {
			if (
				seededRandom() >
				(!this.mutateBoost ? this.mutationRates.cxnWeight : this.mutateBoostRates.cxnWeight)
			)
				con.perturbWeight();
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
		node.perturbActivation();
		this.addNode(node);

		this.addConnection(disabledCon.inNodeId, node.id).weight = 1;
		this.addConnection(node.id, disabledCon.outNodeId).weight = disabledCon.weight;
	}

	addConnectionMutation() {
		let attempt = 0;
		const MAX_ATTEMPT = 128;
		while (attempt++ < MAX_ATTEMPT) {
			const inNode = this.getRandomNode();
			const acceptableNodes = this.getNodes().filter((node) => node.level >= inNode.level);

			if (acceptableNodes.length === 0) {
				continue;
			}

			const outNode = acceptableNodes[Math.floor(seededRandom() * acceptableNodes.length)];

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

	addConnection(inNodeId: number, outNodeId: number, enabled = true) {
		const newCon = new CxnGene(inNodeId, outNodeId, enabled, INNOVATION++);
		this.cxns.set(newCon.innovation, newCon);
		const inNode = this.nodes.get(inNodeId);
		const outNode = this.nodes.get(outNodeId);

		if (inNode !== undefined && outNode !== undefined) {
			inNode.outCxnsId.set(inNode.outCxnsId.size, newCon.innovation);
			outNode.inCxnsId.set(outNode.inCxnsId.size, newCon.innovation);

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

	private calculateNodeLevelRecur(node: NodeGene, level: number) {
		level++;
		node.level = Math.max(node.level, level);

		for (const [, id] of node.outCxnsId) {
			const con = this.cxns.get(id);
			if (con !== undefined) {
				const childNode = this.nodes.get(con.outNodeId);
				if (childNode !== undefined) this.calculateNodeLevelRecur(childNode, level);
			}
		}
	}

	private existConnection(nodeIn: NodeGene, nodeOut: NodeGene) {
		for (const [, conId] of nodeIn.outCxnsId) {
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

	setMutationRate(opts: MutationRates) {
		const { activation, cxn, bias, cxnWeight, node } = opts;
		if (activation) this.mutationRates.activation = activation;
		if (cxn) this.mutationRates.cxn = cxn;
		if (bias) this.mutationRates.bias = bias;
		if (cxnWeight) this.mutationRates.cxnWeight = cxnWeight;
		if (node) this.mutationRates.node = node;
	}

	getMutationRate() {
		return this.mutationRates;
	}

	setMutateBoostRate(opts: MutationRates) {
		const { activation, cxn, bias, cxnWeight, node } = opts;
		if (activation) this.mutateBoostRates.activation = activation;
		if (cxn) this.mutateBoostRates.cxn = cxn;
		if (bias) this.mutateBoostRates.bias = bias;
		if (cxnWeight) this.mutateBoostRates.cxnWeight = cxnWeight;
		if (node) this.mutateBoostRates.node = node;
	}

	getMutateBoostRate() {
		return this.mutateBoostRates;
	}

	copy() {
		const clone = new Genome();
		clone.setMutationRate(this.mutationRates);
		clone.nodes = new Map(
			Array.from(this.nodes.entries()).map((entry) => [entry[0], entry[1].copy()])
		);
		clone.cxns = new Map(
			Array.from(this.cxns.entries()).map((entry) => [entry[0], entry[1].copy()])
		);
		return clone;
	}

	static newRandGenome(input: number, out: number, maxHidden: number, linkProb?: number) {
		const genome = new Genome();
		let nodeCount = 0;

		/* input layer */
		for (let i = 0; i < input; i++) {
			genome.addNode(new NodeGene(NodeType.INPUT, nodeCount));
			nodeCount++;
		}
		const lastInputNode = nodeCount;

		/* hidden layer */
		const firstHiddenNode = nodeCount;
		const hiddenCount = maxHidden <= 1 ? 1 : getRandomInt(1, maxHidden + 1);
		for (let i = 0; i < hiddenCount; i++) {
			genome.addNode(new NodeGene(NodeType.HIDDEN, nodeCount));
			nodeCount++;
		}
		const lastHiddenNode = nodeCount;

		/* output layer */
		const firstOutputNode = nodeCount;
		for (let i = 0; i < out; i++) {
			genome.addNode(new NodeGene(NodeType.OUTPUT, nodeCount));
			nodeCount++;
		}
		const lastOutputNode = nodeCount;

		/* input to hidden cxns */
		for (let i = 0; i < lastInputNode; i++) {
			for (let j = firstHiddenNode; j < lastHiddenNode; j++) {
				if (!linkProb) {
					genome.addConnection(i, j);
				} else {
					if (seededRandom() < linkProb) genome.addConnection(i, j);
				}
			}
		}

		/* hidden to output cxns */
		for (let i = firstHiddenNode; i < lastHiddenNode; i++) {
			for (let j = firstOutputNode; j < lastOutputNode; j++) {
				if (!linkProb) {
					genome.addConnection(i, j);
				} else {
					if (seededRandom() < linkProb) genome.addConnection(i, j);
				}
			}
		}
		return genome;
	}
}
