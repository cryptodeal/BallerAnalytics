import { MathActivations } from '../math';
import array from '@stdlib/ndarray/array';
import Float64Array from '@stdlib/array/float64';
import type { ndarray } from '@stdlib/types/ndarray';

export class FastNetwork {
	/* index of source neuron */
	public srcIdx!: number;
	/* index of target neuron */
	public targetIdx!: number;
	/* weight of this link */
	public weight!: number;
	/* signal relayed by this link */
	public signal!: number;
}

export class FastControlNode {
	/* activation function for control node */
	public activationType!: MathActivations;
	/* the indexes of the input nodes */
	public inputIdxs!: number[];
	/* the indexes of the output nodes */
	public outputIdxs!: number[];
}

/* network solver implementation to be used for large neural network simulations */
export class FastModularNetworkSolver {
	/* network id */
	public id!: number;
	/* name of this network */
	public name!: string;

	/* current activation values per each neuron */
	public neuronSignals!: Float64Array;
	/**
	 * array is a parallel of neuronSignals,
	 * used to test network relaxation
	 */
	public neuronSignalsBeingProcessed!: Float64Array;

	/**
	 * the activation functions per neuron, must be in
	 * the same order as neuronSignals; has null entries
	 * for neurons that are inputs or outputs of a module.
	 */
	public activationFunctions: (MathActivations | null)[];
	/* bias values associated w neurons */
	public biasList: Float64Array;
	/* control nodes relaying between network modules */
	public modules: FastControlNode[];
	/* the cxns */
	public cxns: FastNetwork[];

	/* # of input neurons */
	public inputNeuronCount: number;
	/**
	 * total # of sensors in network (input + bias).
	 * Also the index of the first output neuron in the
	 * neuron signals.
	 */
	public sensorNeuronCount: number;
	/* # of output neurons */
	public outputNeuronCount: number;
	/**
	 * # of bias neurons (usually 1); this is also
	 * the index of the first input neuron in the
	 * neuron signals.
	 */
	public biasNeuronCount: number;
	/* # of total neurons in network */
	public totalNeuronCount: number;

	/**
	 * for recursive activation, marks whether a
	 * given node has been activated yet.
	 */
	public activated!: boolean[];
	/**
	 * for recursive activation, marks whether a
	 * given node is currently being calculated
	 * (recurrent cxns processing)
	 */
	public inActivation!: boolean[];
	/**
	 * for recursive activation, the previous activation
	 * values of recurrent connetions (recurrent cxns processing)
	 */
	public lastActivation!: Float64Array;

	/**
	 * adjacent list to hold IDs of outgoing
	 * nodes for each network node
	 */
	public adjList!: ndarray;
	/**
	 * adjacent list to hold IDs of incoming
	 * nodes for each network node
	 */
	public reverseAdjList!: ndarray;
	/**
	 * adjacent matrix to hold IDs of incoming
	 * nodes for each network node
	 */
	public adjMatrix!: ndarray;

	constructor(
		biasNeuronCount: number,
		inputNeuronCount: number,
		outputNeuronCount: number,
		totalNeuronCount: number,
		activationFunctions: (MathActivations | null)[],
		cxns: any[],
		biasList: Float64Array,
		modules: FastControlNode[]
	) {
		this.biasNeuronCount = biasNeuronCount;
		this.inputNeuronCount = inputNeuronCount;
		this.sensorNeuronCount = biasNeuronCount + inputNeuronCount;
		this.outputNeuronCount = outputNeuronCount;
		this.totalNeuronCount = totalNeuronCount;
		this.activationFunctions = activationFunctions;
		this.cxns = cxns;
		this.biasList = biasList;
		this.modules = modules;
	}

	/* creates new fast modular network solver */
	static newFastModularNetworkSolver(
		biasNeuronCount: number,
		inputNeuronCount: number,
		outputNeuronCount: number,
		totalNeuronCount: number,
		activationFunctions: (MathActivations | null)[],
		cxns: any[],
		biasList: Float64Array,
		modules: FastControlNode[]
	) {
		const fmm = new FastModularNetworkSolver(
			biasNeuronCount,
			inputNeuronCount,
			outputNeuronCount,
			totalNeuronCount,
			activationFunctions,
			cxns,
			biasList,
			modules
		);

		/**
		 * allocate the arrays that store the states
		 * at different points in the neural network.
		 * the neuron signals are init to default 0;
		 * only bias nodes need to be set to 1.
		 */
		fmm.neuronSignals = new Float64Array(totalNeuronCount);
		fmm.neuronSignalsBeingProcessed = new Float64Array(totalNeuronCount);
		for (let i = 0; i < biasNeuronCount; i++) {
			fmm.neuronSignals[i] = 1; // BIAS neuron signal
		}

		/* allocates activation arrays */
		fmm.activated = new Array(totalNeuronCount);
		fmm.inActivation = new Array(totalNeuronCount);
		fmm.lastActivation = new Float64Array(totalNeuronCount);

		/**
		 * build adjacent lists and matrix for fast access
		 * to incoming/outgoing nodes and cxn weights
		 */
		fmm.adjList = array({ shape: [totalNeuronCount, 0] });
		fmm.reverseAdjList = array({ shape: [totalNeuronCount, 0] });
		fmm.adjMatrix = array({ shape: [totalNeuronCount, totalNeuronCount] });

		for (let i = 0; i < cxns.length; i++) {
			const crs: number = cxns[i].srcIdx;
			const crt: number = cxns[i].targetIdx;

			/* holds outgoing nodes */
			fmm.adjList[crs].push(crt);
			/* holds incoming nodes */
			fmm.reverseAdjList[crt].push(crs);
			/* holds link weight */
			fmm.adjMatrix[crs][crt] = cxns[i].weight;
		}
		return fmm;
	}

	/**
	 * forwarSteps propagates activation wave through
	 * all network nodes provided number of steps in
	 * forward direction. Returns true if activation
	 * wave passed from all inputs to the outputs.
	 */
	public forwardStep(steps: number) {
		for (let i = 0; i < steps; i++) {
			// TODOthis.forwardStepOnce();
		}
	}
}
