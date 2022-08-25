import { ActivationType, NodeActivators } from '../math';
import { array, matrix, type NDArray } from 'vectorious';
import { boolToInt } from '../utils';

export class FastNetworkLink {
	/* index of source neuron */
	public srcIdx: number;
	/* index of target neuron */
	public targetIdx: number;
	/* weight of this link */
	public weight!: number;
	/* signal relayed by this link */
	public signal!: number;

	constructor(srcIdx: number, targetIdx: number, weight?: number, signal?: number) {
		this.srcIdx = srcIdx;
		this.targetIdx = targetIdx;
		if (weight) this.weight = weight;
		if (signal) this.signal = signal;
	}
}

export class FastControlNode {
	/* activation function for control node */
	public activationType: ActivationType;
	/* the indexes of the input nodes */
	public inputIdxs: NDArray;
	/* the indexes of the output nodes */
	public outputIdxs: NDArray;

	constructor(inputIdxs: NDArray, outputIdxs: NDArray, activationType: ActivationType) {
		this.activationType = activationType;
		this.inputIdxs = inputIdxs;
		this.outputIdxs = outputIdxs;
	}
}

/* network solver implementation to be used for large neural network simulations */
export class FastModularNetworkSolver {
	/* network id */
	public id!: number;
	/* name of this network */
	public name!: string;

	/* current activation values per each neuron */
	public neuronSignals!: NDArray;
	/**
	 * array is a parallel of neuronSignals,
	 * used to test network relaxation
	 */
	public neuronSignalsBeingProcessed!: NDArray;

	/**
	 * the activation functions per neuron, must be in
	 * the same order as neuronSignals; has null entries
	 * for neurons that are inputs or outputs of a module.
	 */
	public activationFunctions: NDArray;
	/* bias values associated w neurons */
	public biasList: NDArray;
	/* control nodes relaying between network modules */
	public modules: Map<number, FastControlNode>;
	/* the cxns */
	public cxns: Map<number, FastNetworkLink>;

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
	public activated!: NDArray;
	/**
	 * for recursive activation, marks whether a
	 * given node is currently being calculated
	 * (recurrent cxns processing)
	 */
	public inActivation!: NDArray;
	/**
	 * for recursive activation, the previous activation
	 * values of recurrent connetions (recurrent cxns processing)
	 */
	public lastActivation!: NDArray;

	/**
	 * adjacent list to hold IDs of outgoing
	 * nodes for each network node
	 */
	public adjList!: Map<number, NDArray>;
	/**
	 * adjacent list to hold IDs of incoming
	 * nodes for each network node
	 */
	public reverseAdjList!: Map<number, NDArray>;
	/**
	 * adjacent matrix to hold IDs of incoming
	 * nodes for each network node
	 */
	public adjMatrix!: NDArray;

	constructor(
		biasNeuronCount: number,
		inputNeuronCount: number,
		outputNeuronCount: number,
		totalNeuronCount: number,
		activationFunctions: NDArray,
		cxns: Map<number, FastNetworkLink>,
		biasList: NDArray,
		modules: Map<number, FastControlNode>
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
		activationFunctions: NDArray,
		cxns: Map<number, FastNetworkLink>,
		biasList: NDArray,
		modules: Map<number, FastControlNode>
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
		fmm.neuronSignals = array({ length: totalNeuronCount }).fill(0);
		fmm.neuronSignalsBeingProcessed = array({ length: totalNeuronCount }).fill(0);
		for (let i = 0; i < biasNeuronCount; i++) {
			fmm.neuronSignals.set(i, 1); // BIAS neuron signal
		}

		/* allocates activation arrays */
		fmm.activated = array({ length: totalNeuronCount }).fill(0);
		fmm.inActivation = array({ length: totalNeuronCount }).fill(0);
		fmm.lastActivation = array({ length: totalNeuronCount }).fill(0);

		/**
		 * build adjacent lists and matrix for fast access
		 * to incoming/outgoing nodes and cxn weights
		 */
		fmm.adjList = new Map(new Array(totalNeuronCount).fill(array()));
		fmm.reverseAdjList = new Map(new Array(totalNeuronCount).fill(array()));
		fmm.adjMatrix = matrix(totalNeuronCount, totalNeuronCount);

		for (let i = 0; i < cxns.size; i++) {
			const crs: number = cxns[i].srcIdx;
			const crt: number = cxns[i].targetIdx;

			/* holds outgoing nodes */
			fmm.adjList.set(crs, (fmm.adjList.get(crs) as NDArray).push(crt));
			/* holds incoming nodes */
			fmm.reverseAdjList.set(crt, (fmm.reverseAdjList.get(crt) as NDArray).push(crs));
			/* holds link weight */
			fmm.adjMatrix.set(crs, crt, cxns[i].weight);
		}
		return fmm;
	}

	/**
	 * forwarSteps propagates activation wave through
	 * all network nodes provided number of steps in
	 * forward direction. Returns true if activation
	 * wave passed from all inputs to the outputs.
	 */
	public forwardSteps(steps: number) {
		for (let i = 0; i < steps; i++) {
			// TODOthis.forwardStepOnce();
		}
	}
	/**
	 * recursiveSteps propagates activation wave through
	 * all network nodes provided number of steps by
	 * recursion from output nodes; returns true if
	 * activation wave passed from all inputs to the outputs.
	 * Preferred method of network activation when # of
	 * forward steps can't be calculated easily && no network
	 * modules are set.
	 */
	public recursiveSteps() {
		if (this.modules.size > 0) {
			console.error('recursive activation can not be used for network with defined modules');
			return false;
		}

		/* init boolean arrays/set last activation signal for output/hidden neurons */
		for (let i = 0; i < this.totalNeuronCount; i++) {
			/* if i is not input node, set active; else, ensure inactive (false) */
			this.activated.set(i, boolToInt(i < this.sensorNeuronCount));
			this.inActivation.set(i, boolToInt(false));

			/* set last activation for output/hidden neurons */
			if (i >= this.sensorNeuronCount) {
				this.lastActivation.set(i, this.neuronSignals.get(i));
			}
		}

		/* get each output node activation recursively */
		for (let i = 0; i < this.totalNeuronCount; i++) {
			const index = this.sensorNeuronCount + 1;
			this.recursiveActivateNode(index);
		}
	}

	/**
	 * propagate activation wave by recursively looking
	 * for input signals graph for a given output neuron
	 */
	public recursiveActivateNode(currentNode: number): boolean {
		let res = false;
		/* if reached input node, return since signal is already set */
		if (this.activated.get(currentNode)) {
			this.inActivation.set(currentNode, boolToInt(false));
			return true;
		}

		/* mark node as being calculated */
		this.inActivation.set(currentNode, boolToInt(true));

		/* set pre-signal to 0 */
		this.neuronSignalsBeingProcessed.set(currentNode, 0);

		/* reverseAdjList holds incoming cxns; iterate through each, activating */
		const countReverseAdjList = (this.reverseAdjList.get(currentNode) as NDArray).length;
		for (let i = 0; i < countReverseAdjList; i++) {
			const currentAdjNode = (this.reverseAdjList.get(currentNode) as NDArray).get(i);
			/**
			 * if node is being activated, it's reached a cycle or
			 * recurrent cxn; use previous activation in this case
			 */
			if (this.inActivation.get(currentAdjNode)) {
				const valUpdate =
					this.neuronSignalsBeingProcessed.get(currentNode) +
					this.lastActivation.get(currentAdjNode) * this.adjMatrix.get(currentAdjNode, currentNode);
				this.neuronSignalsBeingProcessed.set(currentNode, valUpdate);
			} else {
				/* proceed as normal, recurse if neuron not yet activated */
				if (!this.activated.get(currentAdjNode)) {
					res = this.recursiveActivateNode(currentAdjNode);
					console.error(`failed to recursively activate neuron at ${currentAdjNode}`);
					if (!res) return false;
				}

				/* add it to the new activation */
				const valUpdate =
					this.neuronSignalsBeingProcessed.get(currentNode) +
					this.neuronSignals.get(currentAdjNode) * this.adjMatrix.get(currentAdjNode, currentNode);
				this.neuronSignalsBeingProcessed.set(currentNode, valUpdate);
			}
		}

		/* mark neuron as completed */
		this.activated.set(currentNode, boolToInt(true));

		/* mark no longer being calculated (cycle completion) */
		this.inActivation.set(currentNode, boolToInt(false));

		/* set signal after running through the activation function */
		const input = this.neuronSignalsBeingProcessed.get(currentNode);
		const aType = this.activationFunctions.get(currentNode);
		const valUpdate = NodeActivators.activateByType({ input, aType });
		if (!valUpdate) {
			console.error(`failed to activate neuron at ${currentNode}`);
			res = false;
		} else {
			this.neuronSignals.set(currentNode, valUpdate);
			res = true;
		}
		return res;
	}

	/**
	 * attempts to relax network for given # of steps;
	 * network is `relaxed` when abs val of change  at any
	 * given point is < maxAllowedSignalDelta during
	 * activation wave propagation. If maxAllowedSignalDelta
	 * value is <= 0, method returns true w/o checking relaxation
	 */
	public relax(maxSteps: number, maxAllowedSignalDelta: number) {
		const relaxed = Infinity;
		for (let i = 0; i < maxSteps; i++) {
			const relaxed = this.forwardStep(maxAllowedSignalDelta);
			if (!relaxed) {
				return false;
			}
			break;
		}
		return relaxed;
	}

	/**
	 * performs single step forward through network & tests
	 * if network becomes relaxed; network considered
	 * `relaxed` when abs val of change at any given point
	 * is < maxAllowedSignalDelta during activation wave
	 * propagation.
	 */
	private forwardStep(maxAllowedSignalDelta: number) {
		let isRelaxed = true;
		/**
		 * calc output signal per each connection and
		 * add the signals to the target neurons
		 */
		for (const [, cxn] of this.cxns) {
			this.neuronSignalsBeingProcessed[cxn.targetIdx] +=
				this.neuronSignals[cxn.srcIdx] * cxn.weight;
		}

		/* pass the signals through the single-valued activation fns */
		for (const [, mod] of this.modules) {
			const inputs = array({ length: mod.inputIdxs }).fill(0);
			mod.inputIdxs.forEach((inIdx, i) => {
				inputs.set(i, this.neuronSignalsBeingProcessed.get(inIdx));
			});
			const outputs = NodeActivators.activateModuleByType({ inputs, aType: mod.activationType });
			if (!outputs) {
				return false;
			} else {
				/* save outputs */
				mod.outputIdxs.forEach((outIdx, i) => {
					this.neuronSignalsBeingProcessed[outIdx] = outputs[i];
				});
			}
		}

		/**
		 * move all neuron signals changed in processing
		 * network activation into storage.
		 */
		if (maxAllowedSignalDelta <= 0) {
			/* iterate through output and hidden neurons and collect activations */
			for (let i = this.sensorNeuronCount; i < this.totalNeuronCount; i++) {
				this.neuronSignals.set(i, this.neuronSignalsBeingProcessed.get(i));
				this.neuronSignalsBeingProcessed.set(i, 0);
			}
		} else {
			for (let i = this.sensorNeuronCount; i < this.totalNeuronCount; i++) {
				/* check if any point in network has changed more than small amt */
				isRelaxed =
					isRelaxed &&
					Math.abs(this.neuronSignals.get(i) - this.neuronSignalsBeingProcessed.get(i)) >
						maxAllowedSignalDelta;

				this.neuronSignals.set(i, this.neuronSignalsBeingProcessed.get(i));
				this.neuronSignalsBeingProcessed.set(i, 0);
			}
		}
		return isRelaxed;
	}

	/**
	 * flushes network state, removing all current
	 * activations; returns true if network flushed
	 * successfully, false if error/fails
	 */
	public flush() {
		for (let i = this.biasNeuronCount; i < this.totalNeuronCount; i++) {
			this.neuronSignals.set(i, 0.0);
		}
		return true;
	}

	/* set sensors values to the input nodes of the network */
	public loadSensors(inputs: NDArray) {
		if (inputs.length == this.inputNeuronCount) {
			/* only inputs should be provided */
			for (let i = 0; i < this.inputNeuronCount; i++) {
				this.neuronSignals.set(this.biasNeuronCount + i, inputs.get(i));
			}
		}
	}

	public readOutputs() {
		return this.neuronSignals.slice(
			this.sensorNeuronCount,
			this.sensorNeuronCount + this.outputNeuronCount
		);
	}

	/**
	 * returns the total number of links
	 * between nodes in the network
	 */
	public linkCount() {
		/* count all cxns */
		let linkCount = this.cxns.size;

		/* count all bias links (any type) */
		if (this.biasNeuronCount > 0) {
			for (let i = 0; i < this.biasList.length; i++) {
				if (this.biasList.get(i) != 0) {
					linkCount++;
				}
			}
		}

		/* count all module links */
		if (this.modules.size > 0) {
			for (const [, mod] of this.modules) {
				linkCount += mod.inputIdxs.length + mod.outputIdxs.length;
			}
		}

		return linkCount;
	}

	/* stringify */
	public string = () =>
		`FastModularNetwork, id: ${this.id}, name: ${this.name}, neurons: ${
			this.totalNeuronCount
		},\n\tinputs: ${this.inputNeuronCount},\tbias: ${this.biasNeuronCount},\toutputs: ${
			this.outputNeuronCount
		},\t hidden: ${this.totalNeuronCount - this.sensorNeuronCount - this.outputNeuronCount}`;
}
