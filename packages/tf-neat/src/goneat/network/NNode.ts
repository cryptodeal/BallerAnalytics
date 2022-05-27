import { math } from '../math';
import { NeuronType } from '.';

export class NNode {
	/* id of node */
	public id: number;

	/* type of node activation function */
	public activationType = math.SigmoidSteepenedActivation;
	/* neuron type for this node (HIDDEN, INPUT, OUTPUT, BIAS) */
	public neuronType: NeuronType = NeuronType.HIDDEN;

	/* node's activation value */
	// TODO: 	public activation: number;

	/* number of activations for current node */
	public activationCount?: number;
	/* activation sum */
	public activationSum?: number;

	/* list of all incoming cxns */
	public inCxns: Map<number, any> = new Map();
	/* list of all outgoing cxns */
	public outCxns: Map<number, any> = new Map();
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
	public params: number[] = [];

	/**
	 * activation value of node at time t-1;
	 * holds the prior step's activation for recurrent
	 */
	public lastActivation?: number;

	/**
	 * Activation value of node at time t-1;
	 * holds the activation before the prior step's.
	 * necessary for a special recurrent case when inNode of
	 * recurrent link is one time step ahead of the outNode.
	 * The inNode needs to send from TWO time steps back.
	 */
	public lastActivation2?: number;

	/* if true, node is active - used during node activation */
	public isActive = false;

	constructor(nodeId: number, neuronType: NeuronType) {
		this.id = nodeId;
	}
}
