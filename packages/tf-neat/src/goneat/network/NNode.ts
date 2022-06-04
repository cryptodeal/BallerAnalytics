import { ActivationType, NodeActivators } from '../math';
import { Link } from './Link';
import { NodeNeuronType, NNodeType, neuronTypeName } from '.';
import type { NDArray } from 'vectorious';

export type NNodeAttributes = 'neuronType' | 'activationType' | 'parameters';

export class NNode {
	/* id of node */
	public id: number;

	/* type of node activation function */
	public activationType: ActivationType = ActivationType.SigmoidSteepenedActivation;
	/* neuron type for this node (HIDDEN, INPUT, OUTPUT, BIAS) */
	public neuronType: NodeNeuronType = NodeNeuronType.HiddenNeuron;

	/* node's activation value */
	public activation = 0;

	/* number of activations for current node */
	public activationsCount = 0;
	/* activation sum */
	public activationSum = 0;

	/* list of all incoming cxns */
	public inCxns: Map<number, Link> = new Map();
	/* list of all outgoing cxns */
	public outCxns: Map<number, Link> = new Map();
	/* trait linked to this node */
	public trait;

	/* used for gene decoding; references analogue to this node in organism phenotype */
	public phenotypeAnalogue: any;

	/* flag to use for loop detection */
	public visited = false;

	/**
	 *  - LEARNING PARAMETERS:
	 * the following params are used in neurons that learn
	 * through habituation, sensitization, or Hebbian-type
	 * processes
	 */
	public params!: NDArray;

	/**
	 * activation value of node at time t-1;
	 * holds the prior step's activation for recurrent
	 */
	public lastActivation = 0;

	/**
	 * Activation value of node at time t-1;
	 * holds the activation before the prior step's.
	 * necessary for a special recurrent case when inNode of
	 * recurrent link is one time step ahead of the outNode.
	 * The inNode needs to send from TWO time steps back.
	 */
	public lastActivation2 = 0;

	/* if true, node is active - used during node activation */
	public isActive = false;

	/**
	 * creates new node w specified ID & neuron
	 * type (INPUT, HIDDEN, OUTPUT, BIAS)
	 */
	constructor(nodeId: number, neuronType?: NodeNeuronType) {
		this.id = nodeId;
		if (neuronType) this.neuronType = neuronType;
	}

	/* cytoscape helper methods */
	public getCyJsID() {
		return 'n' + this.id.toString();
	}

	/* returns the ID of the node */
	public ID() {
		return this.id;
	}

	/**
	 * attributes returns list of standard attributes
	 * associated with graph node
	 */
	public attributes() {
		const attr: Map<NNodeAttributes, number | NDArray> = new Map();
		attr.set('neuronType', this.neuronType);
		attr.set('activationType', this.activationType);
		if (this.params?.length) attr.set('parameters', this.params);
		return attr;
	}

	/**
	 * construct NNode clone of given NNode
	 * w given trait for genome purposes
	 */
	static clone(n: NNode, t: any) {
		const node = new NNode(n.id, n.neuronType);
		node.activationType = n.activationType;
		node.trait = n.trait;
		return node;
	}

	public setActivation(input: number) {
		/* keep mem of activations for potential time delayed cxns */
		this.saveActivations();

		/* set new activation value */
		this.activation = input;

		/* increment the activationCount */
		this.activationsCount++;
	}

	/* saves current node's activations for potential time delayed cxns */
	private saveActivations() {
		this.lastActivation2 = this.lastActivation;
		this.lastActivation = this.activation;
	}

	/* returns activation for a current step */
	public getActiveOut = () => (this.activationsCount > 0 ? this.activation : 0.0);

	/* returns activation from PRIOR time step */
	public getActiveOutTd = () => (this.activationsCount > 1 ? this.lastActivation : 0.0);

	/* returns true if this node is SENSOR */
	public isSensor = () =>
		this.neuronType == NodeNeuronType.InputNeuron || this.neuronType == NodeNeuronType.BiasNeuron;

	/* returns true if this node is NEURON */
	public isNeuron = () =>
		NodeNeuronType.HiddenNeuron || this.neuronType == NodeNeuronType.OutputNeuron;

	/* If the node is a SENSOR, returns TRUE and loads the value */
	public sensorLoad(load: number) {
		if (this.isSensor()) {
			/* keep mem of activations for potential time delayed cxns */
			this.saveActivations();
			/* puts sensor into next time-step */
			this.activationsCount++;
			this.activation = load;
			return true;
		} else {
			return false;
		}
	}

	/**
	 * adds a non-recurrent outgoing link to this node.
	 * USE METHOD W CAUTION; method doesn't create full
	 * duplex link needed for proper network activation;
	 * method is intended only for linking control nodes.
	 * Instead, use connectFrom, which properly creates
	 * all needed links.
	 */
	public addOutgoing(out: NNode, weight: number) {
		const newLink = new Link(weight, this, out, false);
		this.outCxns.set(this.outCxns.size, newLink);
		return newLink;
	}

	/**
	 * adds a non-recurrent incoming link to this node.
	 * USE METHOD W CAUTION; method doesn't create full
	 * duplex link needed for proper network activation;
	 * method is intended only for linking control nodes.
	 * Instead, use connectFrom, which properly creates
	 * all needed links.
	 */
	public addIncoming(incoming: NNode, weight: number) {
		const newLink = new Link(weight, incoming, this, false);
		this.inCxns.set(this.inCxns.size, newLink);
		return newLink;
	}

	/**
	 * creates link between 2 nodes; incoming links of
	 * current node & outgoing links of in node are
	 * updated to reference the new link.
	 */

	public connectFrom(inNode: NNode, weight: number) {
		const newLink = new Link(weight, inNode, this, false);
		this.inCxns.set(this.inCxns.size, newLink);
		inNode.outCxns.set(inNode.outCxns.size, newLink);
		return newLink;
	}

	/* recursively deactivate backwards through the network */
	public flushback() {
		this.activationsCount = 0;
		this.activation = 0;
		this.lastActivation = 0;
		this.lastActivation2 = 0;
		this.isActive = false;
		this.visited = false;
	}

	/* verify flushing for debugging */
	public isFlushedCheck() {
		if (this.activationsCount > 0) {
			console.error(`NNODE: ${this} has activation count ${this.activationsCount}`);
			return false;
		}
		if (this.activation > 0) {
			console.error(`NNODE: ${this} has activation ${this.activation}`);
			return false;
		}
		if (this.lastActivation > 0) {
			console.error(`NNODE: ${this} has lastActivation ${this.lastActivation}`);
			return false;
		}
		if (this.lastActivation2 > 0) {
			console.error(`NNODE: ${this} has lastActivation2 ${this.lastActivation2}`);
			return false;
		}
		return true;
	}

	/**
	 * finds the greatest depth starting from this
	 * neuron at depth d; if maxDepth > 0, it can be used
	 * to stop early in case of very deep network detected
	 */
	public depth(d: number, maxDepth: number) {
		if (maxDepth > 0 && d > maxDepth) {
			/* avoid traversing very deep network */
			console.error(`NNODE: ${this} exceeds max network depth`);
			return maxDepth;
		}

		this.visited = true;
		/* base case */
		if (this.isSensor()) {
			return d;
		} else {
			/* recursion */
			let max = d;
			for (const [, l] of this.inCxns) {
				if (l.inNode.visited) {
					/* skip, already visited (loop detected) */
					continue;
				}
				const curDepth = l.inNode.depth(d + 1, maxDepth);
				if (!curDepth)
					throw new Error(
						`NNODE: ${this} depth error during recursion; failed at l.inNode ${l.inNode}`
					);
				if (curDepth > max) {
					max = curDepth;
				}
			}
			return max;
		}
	}

	/**
	 * convenient method to check network's
	 * node type (SENSOR, NEURON)
	 */
	public nodeType = () => (this.isSensor() ? NNodeType.SensorNode : NNodeType.NeuronNode);

	public string() {
		const activation = NodeActivators.activationNameFromType(this.activationType);
		let active = 'active';
		if (this.isActive) {
			active = 'inactive';
		}
		return `(${this.nodeType()} id:${this.id}, ${neuronTypeName(
			this.neuronType
		)}, ${activation},\t${active} -> step: ${this.activationsCount} = ${this.activation} ${
			this.params
		})`;
	}

	/* prints all fiels of the node to string for debugging */
	public printDebug = () => `NNODE fields:
    \tId: ${this.id}
    \tIsActive: ${this.isActive}
    \tActivation: ${this.activation}
    \tActivation Type: ${NodeActivators.activationNameFromType(this.activationType)}
    \tNeuronType: ${this.neuronType}
    \tActivationsCount: ${this.activationsCount}
    \tActivationsSum: ${this.activationSum}
    \tIncoming: ${this.inCxns}
    \tOutgoing: ${this.outCxns}
    \tTrait: ${this.trait}
    \tPhenotypeAnalogue: ${this.phenotypeAnalogue}
    \tParams: ${this.params}
    \tlastActivation: ${this.lastActivation}
    \tlastActivation2: ${this.lastActivation2}`;
}
