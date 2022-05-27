import zeros from '@stdlib/array-base-zeros';
import { seededRandom } from '../utils';
import equal from 'deep-equal';

export class Genome {
	public id: number;
	public traits: Map<number, any>;
	public nodes: Map<number, any>;
	public genes: Map<number, any>;
	public controlGenes: Map<number, any> = new Map();

	constructor(
		id: number,
		t: Map<number, any> = new Map(),
		n: Map<number, any> = new Map(),
		g: Map<number, any> = new Map()
	) {
		this.id = id;
		this.traits = t;
		this.nodes = n;
		this.genes = g;
	}

	static newRandomGenome(
		newId: number,
		input: number,
		out: number,
		n: number,
		maxHidden: number,
		recurrent: boolean,
		linkProb: number
	) {
		const totalNodes = input + out + maxHidden;
		const matrixDim = totalNodes * totalNodes;

		/* randomized cxn matrix */
		const cxnMat = zeros(matrixDim);

		/* no nodes greater than this number */
		const maxNode = input + n;
		const firstOutput = totalNodes - out + 1;

		/* TODO: create dummy trait for future expansion of genome
      const newTrait = neat.newTrait();
      newTrait.Id = 1;
      newTrait.Params = new Array(neat.NumTraitParams)
    */

		/* create empty genome */
		const genome = new Genome(newId);

		/* step through cxn matrix, randomly enabling cxn */
		for (let count = 0; count < matrixDim; count++) {
			if (seededRandom() < linkProb) cxnMat[count] = 1;
		}

		/* TODO: build input nodes
      for (let i = 1; i <= input; i++){
        let newNode: Node;
        if (i < input) {
          newNode = network.NewNNode(i, network.InputNeuron)
        } else {
          newNode = network.NewNNode(i, network.BiasNeuron)
        }
        newNode.Trait = newTrait
        genome.nodes.append(newNode)
      }
    */

		/* TODO: build hidden nodes
      const hiddenTotal = input + n;
      for (let i = input; i <= hiddenTotal; i++){
        const newNode = network.NewNNode(i, network.HiddenNeuron)
        newNode.Trait = newTrait
        genome.nodes.append(newNode)
      }
    */

		/* TODO: build output nodes
      const hiddenTotal = input + n;
      for (let i = input; i <= hiddenTotal; i++){
        const newNode = network.NewNNode(i, network.HiddenNeuron)
        newNode.Trait = newTrait
        genome.nodes.append(newNode)
      }
    */

		/*
	    i i i n n n n n n n n n n n n n n n n . . . . . . . . o o o o
	    |                                   |                 ^     |
	    |<----------- max_node ------------>|                 |     |
	    |                                                     |     |
	    |<-----------------------total_nodes -----------------|---->|
	                                                          |
	                                                          |
	     first_output ----------------------------------------+
	  */

		let inNode: any,
			outNode: any,
			flagRecurrent: boolean,
			count = 0;

		for (let col = 1; col <= totalNodes; col++) {
			for (let row = 1; row < totalNodes; row++) {
				/* only attempt create link if in the matrix, not into sensor */
				if (
					cxnMat[count] &&
					col > input &&
					(col <= maxNode || col >= firstOutput) &&
					(row <= maxNode || row >= firstOutput)
				) {
					/* if recurrent, always create cxn (gene) */
					let createGene = true;
					if (col > row) {
						flagRecurrent = false;
					} else {
						flagRecurrent = true;
						if (!recurrent) {
							createGene = false;
						}
					}

					/* introduce new cxn (gene) into genome */
					if (createGene) {
						/* retrieve inNode and outNode */
						const nodeCount = genome.nodes.size;
						for (let i = 0; i < nodeCount && (inNode == null || outNode == null); i++) {
							const nodeId = genome.nodes[i].Id;
							if (nodeId == row) {
								inNode = genome.nodes[i];
							}
							if (nodeId == col) {
								outNode = genome.nodes[i];
							}
						}
						/* create the gene */
						const tempRand = seededRandom();
						const weight = seededRandom() < 0.5 ? -tempRand : tempRand;
						/* TODO: const gene = Gene.newFromTrait(newTrait, weight, inNode, outNode, flagRecurrent, count, weight)
            /* add the gene to genome 
            genome.genes.append(gene)
            */
					}
				}
				/* increment count */
				count++;

				/* reset nodes */
				inNode = null;
				outNode = null;
			}
		}
		return genome;
	}

	public isEqual(og: Genome) {
		if (this.traits.size !== og.traits.size) {
			console.error(`traits count mismatch: ${this.traits.size} !== ${og.traits.size}`);
			return false;
		}

		for (const [i, trait] of og.traits) {
			const thisTrait = this.traits.get(i);
			if (!equal(trait, thisTrait)) {
				console.error(`traits mismatch, expected: ${trait}, but found ${thisTrait}`);
				return false;
			}
		}

		if (this.nodes.size !== og.nodes.size) {
			console.error(`nodes count mismatch: ${this.nodes.size} !== ${og.nodes.size}`);
			return false;
		}

		for (const [i, node] of og.nodes) {
			const thisNode = this.nodes.get(i);
			if (!equal(node, thisNode)) {
				console.error(`traits mismatch, expected: ${node}, but found ${thisNode}`);
				return false;
			}
		}

		if (this.genes.size !== og.genes.size) {
			console.error(`genes count mismatch: ${this.genes.size} !== ${og.genes.size}`);
			return false;
		}

		for (const [i, gene] of og.genes) {
			const thisGene = this.genes.get(i);
			if (!equal(gene, thisGene)) {
				console.error(`traits mismatch, expected: ${gene}, but found ${thisGene}`);
				return false;
			}
		}

		if (this.controlGenes.size !== og.controlGenes.size) {
			console.error(
				`control genes count mismatch: ${this.controlGenes.size} !== ${og.controlGenes.size}`
			);
			return false;
		}

		for (const [i, ctrlGene] of og.controlGenes) {
			const thisCtrlGene = this.controlGenes.get(i);
			if (!equal(ctrlGene, thisCtrlGene)) {
				console.error(`traits mismatch, expected: ${ctrlGene}, but found ${thisCtrlGene}`);
				return false;
			}
		}
		return true;
	}

	/* TODO: Write readGenome function */
	public readGenome(id: number) {
		return;
	}

	/* TODO: Write function */
	public write() {
		return;
	}

	/* TODO: Write String, stringer, function */
	public stringify() {
		return;
	}

	/* returns # of non-disabled genes */
	public extrons() {
		let total = 0;
		for (const [, gene] of this.genes) {
			if (gene.isEnabled) total++;
		}
		return total;
	}

	/* returns id of final Node in Genome */
	public getLastNodeId() {
		if (this.nodes.size == 0) {
			console.error('genome has no nodes');
			return -1;
		}
		let id = this.nodes.get(this.nodes.size - 1).id;

		/* check controlGenes */
		for (const [, ctrlGene] of this.controlGenes) {
			if (ctrlGene.controlNode.id > id) id = ctrlGene.controlNode.id;
		}
		return id;
	}

	/* returns innovation number of last gene in Genome + 1 */
	public getNextGeneInnovNum() {
		let innNum = BigInt(0);

		/* check cxn genes */
		if (this.genes.size > 0) {
			innNum = this.genes.get(this.genes.size - 1).innovationNum;
		} else {
			console.error('genome has no genes');
			return -1;
		}

		if (this.controlGenes.size > 0) {
			const cInnNum = this.controlGenes.get(this.controlGenes.size - 1).innovationNum;
			if (cInnNum > innNum) innNum = cInnNum;
		}

		return innNum + BigInt(1);
	}

	/* returns true if genome already includes provided node */
	public hasNode(node?: any) {
		if (node == null) return false;
		if (node.id > this.getLastNodeId()) return false;
		for (const [, n] of this.nodes) {
			if (n.id == node.id) return true;
		}
		return false;
	}

	/* returns true if genome already includes provided gene */
	public hasGene(gene?: any) {
		/**
		 * gene has innovation number greater than the next innovationNum
		 * for this genome, so this gene is not in this genome's lineage
		 */
		if (gene.innnovationNum >= this.getNextGeneInnovNum()) return false;

		/* find genetically equal link in this genome to provided gene */
		for (const [, g] of this.genes) {
			return true;
		}
		return false;
	}

	/* generates a Network phenotype from this Genome with specified id */
	public genesis(netId: number) {
		/**
		 * Inputs and outputs are collected here for network.
		 * All nodes are collected in `allList` -
		 * this is useful for network traversing routines
		 */
		const inList: any[] = [];
		const outList: any[] = [];
		const allList: any[] = [];

		let newNode;
		for (const [, n] of this.nodes) {
			/* TODO: implement network
			newNode = network.newNNodeCopy(n, n.trait);
      */
		}
	}
}
