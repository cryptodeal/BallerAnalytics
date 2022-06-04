import { ActivationType, NodeActivationFactory, NodeActivators } from '../math';
import { Link } from './Link';
import { NodeNeuronType, NodeNeuronName, NNodeType, neuronTypeName } from '../network';
import { GraphNetwork } from './index';
import { array, type NDArray } from 'vectorious';
import type { ElementDefinition, NodeSingular } from 'cytoscape';

export type NodeAttributes = Record<string, number | string | boolean> & {
	activation: number;
	activationsCount: number;
	activationSum: number;
	activationFunc: string;
	neuronType: string;
	nodeType: string;
	inputCxnCount: number;
	outputCxnCount: number;
	controlNode: boolean;
	trait?: string;
	phenotypeAnalogue?: any;
	visited: boolean;
	params?: NDArray;
	lastActivation: number;
	lastActivation2: number;
	isActive: boolean;
};

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

	static nodeToCyJsNode(node: NNode, controlNode = false): ElementDefinition {
		let actName = NodeActivators.activationNameFromType(node.activation);
		if (!actName) actName = 'unknown';
		const attr: NodeAttributes = {
			activation: node.activation,
			activationsCount: node.activationsCount,
			activationSum: node.activationSum,
			activationFunc: actName,
			neuronType: GraphNetwork.neuronTypeName(node.neuronType),
			nodeType: GraphNetwork.nodeTypeName(node.nodeType()),
			inputCxnCount: node.inCxns.size,
			outputCxnCount: node.outCxns.size,
			controlNode,
			visited: false,
			lastActivation: 0,
			lastActivation2: 0,
			isActive: false
		};
		if (node.trait) attr.trait = node.trait.string();
		if (node.phenotypeAnalogue) attr.phenotypeAnalogue = node.phenotypeAnalogue.string();
		if (node.params) attr.params = node.params;
		return {
			group: 'nodes',
			data: {
				id: node.getCyJsID(),
				...attr
			}
		};
	}

	static setActivation(n: NodeSingular, input: number) {
		/* keep mem of activations for potential time delayed cxns */
		NNode.saveActivations(n);

		/* set new activation value */
		n.data('activation', input);

		/* increment the activationCount */
		n.data('activationsCount', n.data('activationsCount') + 1);
	}

	/* saves current node's activations for potential time delayed cxns */
	static saveActivations(node: NodeSingular) {
		node.data({
			lastActivation2: node.data('lastActivation'),
			lastActivation: node.data('activation')
		});
	}

	/* returns activation for a current step */
	static getActiveOut = (n: NodeSingular) =>
		n.data('activationsCount') > 0 ? (n.data('activationsCount') as number) : 0.0;

	/* returns activation from PRIOR time step */
	static getActiveOutTd = (n: NodeSingular) =>
		n.data('activationsCount') > 1 ? (n.data('lastActivation') as number) : 0.0;

	/* returns true if this node is SENSOR */
	static isSensor = (node: NodeSingular) =>
		node.data('neuronType') == NodeNeuronName.INPUT ||
		node.data('neuronType') == NodeNeuronName.BIAS;

	/* returns true if this node is NEURON */
	static isNeuron = (node: NodeSingular) =>
		node.data('neuronType') == NodeNeuronName.HIDDEN ||
		node.data('neuronType') == NodeNeuronName.OUTPUT;

	/* If the node is a SENSOR, returns TRUE and loads the value */
	static sensorLoad(node: NodeSingular, load: number) {
		if (NNode.isSensor(node)) {
			/* keep mem of activations for potential time delayed cxns */
			NNode.saveActivations(node);
			/* puts sensor into next time-step */
			node.data({
				activationsCount: node.data('activationsCount') + 1,
				activation: load
			});
			return true;
		} else {
			return false;
		}
	}

	/* recursively deactivate backwards through the network */
	static flushback(n: NodeSingular) {
		n.data({
			activationsCount: 0,
			activation: 0,
			lastActivation: 0,
			lastActivation2: 0,
			isActive: false,
			visited: false
		});
	}

	/* verify flushing for debugging */
	static isFlushedCheck(n: NodeSingular) {
		if (n.data('activationsCount') > 0) {
			console.error(`NNODE: ${n.data()} has activation count ${n.data('activationsCount')}`);
			return false;
		}
		if (n.data('activation') > 0) {
			console.error(`NNODE: ${n.data()} has activation ${n.data('activation')}`);
			return false;
		}
		if (n.data('lastActivation') > 0) {
			console.error(`NNODE: ${n.data()} has lastActivation ${n.data('lastActivation')}`);
			return false;
		}
		if (n.data('lastActivation2') > 0) {
			console.error(`NNODE: ${n.data()} has lastActivation2 ${n.data('lastActivation2')}`);
			return false;
		}
		return true;
	}

	/**
	 * convenient method to check network's
	 * node type (SENSOR, NEURON)
	 */
	public nodeType = () =>
		this.neuronType == NodeNeuronType.InputNeuron || this.neuronType == NodeNeuronType.BiasNeuron
			? NNodeType.SensorNode
			: NNodeType.NeuronNode;
}
