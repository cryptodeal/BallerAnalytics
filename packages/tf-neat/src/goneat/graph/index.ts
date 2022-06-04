import cytoscape from 'cytoscape';
import cytoscapeAllPaths from 'hm-cytoscape-all-paths';
import { Gene } from '../genetics/Gene';
import deepEqual from 'deep-equal';
import { array, NDArray } from 'vectorious';
import { NodeActivationFactory, NodeActivators } from '../math';
import { NNode, type NodeAttributes } from './NNode';

import type {
	Core,
	ElementDefinition,
	EdgeSingular,
	NodeSingular,
	NodeCollection
} from 'cytoscape';
import { Link, type EdgeAttributes } from './Link';
import { FastControlNode, FastModularNetworkSolver, FastNetworkLink } from '../network/FastNetwork';

export enum NNodeType {
	NeuronNode,
	SensorNode
}

export enum NodeType {
	NEURON = 'NEURON',
	SENSOR = 'SENSOR',
	IDK = 'UNKNOWN NODE TYPE'
}

export enum NodeNeuronType {
	HiddenNeuron,
	InputNeuron,
	OutputNeuron,
	BiasNeuron
}

export enum NodeNeuronName {
	HIDDEN = 'HIDN',
	INPUT = 'INPT',
	OUTPUT = 'OUTP',
	BIAS = 'BIAS',
	IDK = 'UNKNOWN NEURON TYPE'
}
cytoscape.use(cytoscapeAllPaths);

export class GraphNetwork {
	private graph: Core;
	/* network id */
	public id!: number;
	/* name of network */
	public name!: string;

	constructor(all: Map<number, NNode>, control: Map<number, NNode> = new Map()) {
		this.graph = cytoscape({
			headless: true,
			styleEnabled: false
		});

		const edges: ElementDefinition[] = [];

		/* add all normal nodes */
		for (const [, node] of all) {
			/* populate node data to graph */
			this.graph.add(NNode.nodeToCyJsNode(node));

			/* populate edges data from the incoming side */
			for (const [, cxn] of node.inCxns) {
				edges.push(Link.linkToCyJsEdge(cxn));
			}
		}

		/* add all control nodes */
		for (const [, node] of control) {
			/* populate node data to graph */
			this.graph.add(NNode.nodeToCyJsNode(node, true));

			/* populate edges data from the incoming side */
			for (const [, cxn] of node.inCxns) {
				edges.push(Link.linkToCyJsEdge(cxn));
			}

			/* populate edges data from the outgoing side */
			for (const [, cxn] of node.outCxns) {
				edges.push(Link.linkToCyJsEdge(cxn));
			}
		}
	}
	/* other utils/helpers */

	/* creates a new gene and adds to graph */
	public newGene(
		weight: number,
		inNode: NNode,
		outNode: NNode,
		recurrent: boolean,
		innovationNum: number,
		mutationNum: number
	) {
		return new Gene(new Link(weight, inNode, outNode, recurrent), innovationNum, mutationNum);
	}

	/* collection of nodes that connect network modules */
	public controlNodes = (): NodeCollection => this.graph.nodes(`[controlNode = true]`);
	/* collection of NNodes that input into network */
	public inputNodes = (): NodeCollection =>
		this.graph.nodes(`[neuronType = ${NodeNeuronName.INPUT}]`);
	/* collection of bias nodes in network */
	public biasNodes = (): NodeCollection =>
		this.graph.nodes(`[neuronType = ${NodeNeuronName.BIAS}]`);
	/* collection of hidden nodes in network */
	public hiddenNodes = (): NodeCollection =>
		this.graph.nodes(`[neuronType = ${NodeNeuronName.HIDDEN}]`);
	/* collection of all nodes in network, except MIMO control nodes */
	public allNodes = (): NodeCollection => this.graph.nodes().difference('[controlNode = true]');
	/* collection of NNodes that output from network */
	public outputNodes = (): NodeCollection =>
		this.graph.nodes(`[neuronType = ${NodeNeuronName.OUTPUT}]`);
	/* collection of all nodes in nework, includes MIMO control nodes */
	public allNodesMIMO = (): NodeCollection => this.graph.nodes();

	public loadSensors(sensors: NDArray) {
		let counter = 0;
		const inputs = this.inputNodes();
		const inputCount = inputs.length;
		if (sensors.length == inputCount) {
			/* BIAS value provided as input */
			for (let i = 0; i < inputCount; i++) {
				const node = inputs[i];
				if (node) {
					NNode.sensorLoad(node, sensors.get(counter));
					counter += 1;
				}
			}
		} else {
			/* use default BIAS value */
			for (let i = 0; i < inputCount; i++) {
				const node = inputs[i];
				if (node.data('neuronType') === NodeNeuronName.INPUT) {
					NNode.sensorLoad(node, sensors.get(counter));
					counter += 1;
				} else {
					/* default BIAS value */
					NNode.sensorLoad(node, 1.0);
				}
			}
		}
	}

	public activateNode = (n: NodeSingular, a: NodeActivationFactory) =>
		NNode.setActivation(
			n,
			a.activateByType({
				input: n.data('activationSum'),
				auxParams: n.data('params'),
				aType: n.data('activationType')
			})
		);

	public activateModule = (module: NodeSingular, a: NodeActivationFactory) => {
		const inCxns = this.graph.edges(`[target = ${module.id()}]`);
		const inCxnCount = inCxns.length;
		const inputs = array({ length: inCxnCount }).fill(0);

		for (let i = 0; i < inCxnCount; i++) {
			inputs.set(i, NNode.getActiveOut(this.graph.getElementById(inCxns[i].data('source'))));
		}

		const outputs = a.activateModuleByType({
			inputs,
			auxParams: module.data('params'),
			aType: module.data('activationType')
		});
		const outCxns = this.graph.edges(`[source = ${module.id()}]`);
		const outCxnCount = outCxns.length;
		if (outputs.length !== outCxnCount) {
			throw new Error(
				`number of output params ${outputs.length} !== number of output neurons of the module ${outCxnCount}`
			);
		}

		/* set outputs */
		const outputCount = outputs.length;
		for (let i = 0; i < outputCount; i++) {
			NNode.setActivation(this.graph.getElementById(outCxns[i].data('target')), outputs.get(i));
		}
	};

	/**
	 * creates fast network solver based on the
	 * architecture of this network; mainly used
	 * for big networks to improve processing speed.
	 */
	public fastNetworkSolver() {
		/* calculate neurons per layer */
		const outputNeuronCount = this.outputNodes().length;

		/* build bias, input & hidden neuron lists */
		const inList = this.inputNodes();
		const biasList = this.biasNodes();
		const hiddenList = this.hiddenNodes();
		const biasNeuronCount = biasList.length;

		const inputNeuronCount = inList.length;
		const totalNeuronCount = this.allNodes().length;

		/* create activation fn array */
		const activations = array({ length: totalNeuronCount }).fill(0);
		const neuronLookup: Map<number, number> = new Map(); // id:index

		/* walk through neuron nodes in order: bias, input, output, hidden */
		let neuronIdx = this.processList(0, biasList, activations, neuronLookup);
		neuronIdx = this.processList(neuronIdx, inList, activations, neuronLookup);
		this.processList(neuronIdx, hiddenList, activations, neuronLookup);

		/**
		 * walk through neurons in order: input, output, hidden
		 * and create bias/connections lists
		 */
		const biases = array({ length: totalNeuronCount }).fill(0);
		const cxns: Map<number, FastNetworkLink> = new Map();
		let inConnects: undefined | Map<number, FastNetworkLink> = this.processIncomingCxns(
			inList,
			biases,
			neuronLookup
		);
		if (!inConnects) {
			throw new Error('inConnects is undefined');
		} else {
			for (const [i, cxn] of inConnects) {
				cxns.set(i, cxn);
			}
		}
		inConnects = undefined;
		inConnects = this.processIncomingCxns(hiddenList, biases, neuronLookup);
		if (!inConnects) {
			throw new Error('inConnects is undefined');
		} else {
			const initSize = cxns.size;
			for (const [i, cxn] of inConnects) {
				cxns.set(initSize + i, cxn);
			}
		}
		inConnects = undefined;
		inConnects = this.processIncomingCxns(this.outputNodes(), biases, neuronLookup);
		if (!inConnects) {
			throw new Error('inConnects is undefined');
		} else {
			const initSize = cxns.size;
			for (const [i, cxn] of inConnects) {
				cxns.set(initSize + i, cxn);
			}
		}

		/* walk through control neurons */
		const modules: Map<number, FastControlNode> = new Map();
		const controlNodes = this.controlNodes();
		const conrolNodeCount = controlNodes.length;
		for (let i = 0; i < conrolNodeCount; i++) {
			/* collect inputs */
			const cn = controlNodes[i];
			const inCxns = this.graph.edges(`[target = ${cn.id}]`);
			const inCxnCount = inCxns.length;
			const inputs = array({ length: conrolNodeCount }).fill(0);
			for (let j = 0; j < inCxnCount; j++) {
				const inp = inCxns[j];
				const inIdx = neuronLookup.get(Number(inp.data('source').slice(1)));
				if (!inIdx)
					throw new Error(
						`failed lookup for input neuron with ID: ${inp.data(
							'source'
						)} at control neuron: ${cn.id()}`
					);
				inputs.set(j, inIdx);
			}

			/* collect outputs */
			const outputs = array({ length: conrolNodeCount }).fill(0);
			const outCxns = this.graph.edges(`[source = ${cn.id}]`);
			const outCxnCount = outCxns.length;
			for (let j = 0; j < outCxnCount; j++) {
				const out = outCxns[j];
				const outIdx = neuronLookup.get(out.data('target'));
				if (!outIdx)
					throw new Error(
						`failed lookup for output neuron with ID: ${out.data(
							'target'
						)} at control neuron: ${cn.id()}`
					);
				outputs.set(j, outIdx);
			}
			/* build control node */
			modules.set(
				i,
				new FastControlNode(
					inputs,
					outputs,
					NodeActivators.activationTypeFromName(cn.data('activationFunc'))
				)
			);
		}

		return new FastModularNetworkSolver(
			biasNeuronCount,
			inputNeuronCount,
			outputNeuronCount,
			totalNeuronCount,
			activations,
			cxns,
			biases,
			modules
		);
	}

	public processList(
		startIdx: number,
		nList: NodeCollection,
		activations: NDArray,
		neuronLookup: Map<number, number>
	) {
		const nodeCount = nList.length;
		for (let i = 0; i < nodeCount; i++) {
			const ne = nList[i];
			activations.set(Number(ne.id().slice(1)), startIdx);
			neuronLookup.set(Number(ne.id().slice(1)), startIdx);
			startIdx++;
		}
		return startIdx;
	}

	public processIncomingCxns(
		nList: NodeCollection,
		biases: NDArray,
		neuronLookup: Map<number, number>
	) {
		const cxns: Map<number, FastNetworkLink> = new Map();
		const nListSize = nList.length;
		for (let i = 0; i < nListSize; i++) {
			const ne = nList[i];
			const targetIdx = neuronLookup.get(Number(ne.id().slice(1)));
			if (!targetIdx) throw new Error(`failed lookup of source for neuron with ID: ${ne.id()}`);

			const inCxns = this.graph.edges(`[target = ${ne.id()}]`);
			const inCxn = inCxns.length;
			for (let j = 0; j < nListSize; j++) {
				const inp = inCxn[j];
				const inNodeId = inp.data('source');
				const sourceIdx = neuronLookup.get(Number(inNodeId.slice(1)));
				if (!sourceIdx) throw new Error(`failed lookup of source for neuron with ID: ${inNodeId}`);
				const inNode = this.graph.getElementById(inNodeId);
				if (inNode.data('neuronType') === NodeNeuronName.BIAS) {
					/* store bias for target neuron */
					biases.set(targetIdx, biases.get(targetIdx) + inp.data('weight'));
				} else {
					/* save cxn */
					const conn = new FastNetworkLink(sourceIdx, targetIdx, inp.data('weight'));
					cxns.set(cxns.size, conn);
				}
			}
		}
		return cxns;
	}

	/* checks if specified node ID is control node */
	public isControlNode(nid: string) {
		return this.graph.getElementById(nid).data('controlNode');
	}

	public flush() {
		let res = true;
		const allNodes = this.graph.nodes();
		const nodeCount = allNodes.length;
		for (let i = 0; i < nodeCount; i++) {
			const node = allNodes[i];
			NNode.flushback(node);
			if (!NNode.isFlushedCheck(node)) {
				/* failed; no need to continue */
				res = false;
				break;
			}
		}
		return res;
	}

	/* returns true if at least one output node is not active */
	public outputIsOff() {
		const outputs = this.outputNodes();
		const outputCount = outputs.length;
		for (let i = 0; i < outputCount; i++) {
			const node = outputs[i];
			if (node.data('activationsCount') == 0) {
				return true;
			}
		}
		return false;
	}

	/**
	 * attempts to activate network given # of steps
	 * before returning error; normally, maxSteps should
	 * be equal to the maximal activation depth of the
	 * network as returned by maxActivationDepth()
	 * or maxActivationDepthFast()
	 */
	public activateSteps(maxSteps: number) {
		if (maxSteps == 0) {
			console.error(`Network ${this.name} with ID ${this.id} exceeded maxSteps: ${maxSteps}`);
			return false;
		}
		/* for adding to active sum */
		let addAmount = 0.0;
		/* ensure activated at least once */
		let oneTime = false;
		/* used in case output is, in error, truncated from network */
		let abortCount = 0;

		/**
		 * keep activating until all outputs have become active;
		 * this only happens on first activation, after they are
		 * always active
		 */
		while (!this.outputIsOff() || !oneTime) {
			if (abortCount >= maxSteps) {
				console.error(`Network ${this.name} with ID ${this.id} exceeded maxSteps: ${maxSteps}`);
				return false;
			}

			/* for each neuron node, compute sum of its incoming activation */
			const allNodes = this.graph.nodes();
			const allNodeCount = allNodes.length;
			for (let i = 0; i < allNodeCount; i++) {
				const np = allNodes[i];
				if (NNode.isNeuron(np)) {
					/* reset activation value */
					np.data('activationSum', 0.0);

					/**
					 * for each node's incoming connection, add
					 * activity from connection to the activesum
					 */
					const inCxns = this.graph.edges(`[target = ${np.id()}]`);
					const inCxnCount = inCxns.length;
					for (let j = 0; j < inCxnCount; j++) {
						const link = inCxns[j];
						const inNode = this.graph.getElementById(link.data('source'));
						const weight = link.data('weight') as number;
						/* handle possible time delays */
						if (!link.data('isTimeDelayed')) {
							addAmount = weight * NNode.getActiveOut(inNode);
							if (inNode.data('isActive') || NNode.isSensor(inNode)) {
								np.data('isActive', true);
							}
						} else {
							addAmount = weight * NNode.getActiveOutTd(inNode);
						}
						np.data('activationSum', np.data('activationSum') + addAmount);
					} // end for loop iterating over incoming cxns
				} // end if != SENSOR
			} // end for loop iterating over all nodes

			/* activate all the neuron nodes off their incoming cxns */
			for (let i = 0; i < allNodeCount; i++) {
				const np = allNodes[i];
				if (NNode.isNeuron(np)) {
					/* only activate if some active input came in */
					if (np.data('isActive')) {
						/* run the net activation through an activation fn */
						this.activateNode(np, NodeActivators);
					}
				}
			}

			/**
			 * activate all MIMO control genes to propagate
			 * activation through genome modules
			 */
			const controlNodes = this.controlNodes();
			const controlNodeCount = controlNodes.length;
			for (let i = 0; i < controlNodeCount; i++) {
				const cn = controlNodes[i];
				cn.data('isActive', false);
				/* activate control MIMO node as control module */
				this.activateModule(cn, NodeActivators);
				/* mark control node as active */
			}
			oneTime = true;
			abortCount += 1;
		}
		return true;
	}

	/* activate the network so that all outputs are active */
	public activate() {
		return this.activateSteps(20);
	}

	public forwardSteps(steps: number) {
		if (steps <= 0) throw new Error(`Error: expected # activation steps > 0, received ${steps}`);

		for (let i = 0; i < steps; i++) {
			this.activateSteps(steps);
		}
	}

	public recursiveSteps() {
		console.error('method `recursiveSteps` is not yet implemented');
		return false;
	}

	public relax() {
		console.error('method `recursiveSteps` is not yet implemented');
		return false;
	}

	/* prints the values of network outputs to console */
	public printActivation() {
		const outputs = this.outputNodes();
		const outputCount = outputs.length;
		const outputStr = `Network ${this.name} with ID ${this.id} outputs: (`;
		for (let i = 0; i < outputCount; i++) {
			outputStr + `Output ${i}: ${outputs[i].data()}`;
		}
		return outputStr + ')';
	}

	/* prints the values of network inputs to consoles */
	public printInputs() {
		const inputs = this.inputNodes();
		const inputCount = inputs.length;
		const inputStr = `Network ${this.name} with ID ${this.id} inputs: (`;
		for (let i = 0; i < inputCount; i++) {
			inputStr + `Input ${i}: ${inputs[i]}`;
		}
		return inputStr + ')';
	}

	public readOutputs() {
		const outputs = this.outputNodes();
		const outputCount = outputs.length;
		const outs = array({ length: outputCount }).fill(0);
		for (let i = 0; i < outputCount; i++) {
			outs.set(i, outputs[i].data('activation'));
		}
		return outs;
	}

	/**
	 * returns complexity of this network which
	 * is sum of nodes count and links count
	 */
	public complexity() {
		return this.graph.elements().length;
	}

	/**
	 * checks a POTENTIAL link between given inNode
	 * and outNode to see if it must be recurrent; use
	 * count & thresh to jump out in case of infinite loop
	 */
	public isRecurrent(inNode: NodeSingular, outNode: NodeSingular, count: number, thresh: number) {
		/* count node as visited */
		count++;
		if (count > thresh) {
			/* short out - loop detected */
			return false;
		}
		const inNodeData = Object.assign(inNode.data(), {
			inCxns: this.graph.edges(`[target = ${inNode.id()}]`).map((e) => {
				const { source, target } = e.data();
				return { source, target };
			}),
			outCxns: this.graph.edges(`[source = ${inNode.id()}]`).map((e) => {
				const { source, target } = e.data();
				return { source, target };
			})
		});

		const outNodeData = Object.assign(outNode.data(), {
			inCxns: this.graph.edges(`[target = ${outNode.id()}]`).map((e) => {
				const { source, target } = e.data();
				return { source, target };
			}),
			outCxns: this.graph.edges(`[source = ${outNode.id()}]`).map((e) => {
				const { source, target } = e.data();
				return { source, target };
			})
		});
		if (deepEqual(inNodeData, outNodeData)) {
			return true;
		} else {
			/* check back on all links */
			const inCxns = this.graph.edges(`[target = ${inNode.id()}]`);
			const inCxnCount = inCxns.length;
			for (let i = 0; i < inCxnCount; i++) {
				const link = inCxns[i];
				/**
				 * skip links that are already recurrent -
				 * only check back through the forward flow
				 * of signals only
				 */
				if (!link.data('isRecurrent')) {
					if (
						this.isRecurrent(this.graph.getElementById(link.data('source')), outNode, count, thresh)
					) {
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * finds the maximum # of neuron layers
	 * to be activated between an output and
	 * an input layer
	 */
	public findMaxActivationDepth() {
		const allNodesSize = this.graph.nodes().length;
		const inputsSize = this.inputNodes().length;
		const outputsSize = this.outputNodes().length;
		const controlNodesSize = this.controlNodes().length;

		/* quick case where no hidden or control nodes */
		if (allNodesSize == inputsSize + outputsSize && controlNodesSize == 0) {
			/* only 1 layer depth */
			return 1;
		}
		return this.maxActivationDepth();
	}

	/**
	 * finds the maximum # of neuron layers
	 * to be activated between an output and
	 * an input layer; this is the fastest version
	 * of depth calc, but only suitable for simple
	 * networks.
	 *
	 * Errors on modular networks.
	 *
	 *  - Possible to limit maximal depth by setting
	 *  maxDepth > 0.

	 *
	 *  - If maxDepth <= 0, no maximal depth limit set.
	 */
	public maxActivationDepthFast(maxDepth: number) {
		const controlNodes = this.controlNodes();
		if (controlNodes.length > 0)
			throw new Error(`maxActivationDepthFast does not support modular networks`);

		const allNodesSize = this.graph.nodes().length;
		const inputsSize = this.inputNodes().length;
		const outputs = this.outputNodes();
		const outputsSize = outputs.length;
		const controlNodesSize = this.controlNodes().length;
		/* quick case where no hidden or control nodes */
		if (allNodesSize == inputsSize + outputsSize && controlNodesSize == 0) {
			/* only 1 layer depth */
			return 1;
		}

		let max = 0;
		for (let i = 0; i < outputsSize; i++) {
			const currDepth = this.depth(outputs[i], 1, maxDepth); //1 ensures this layer is counted
			if (currDepth > max) max = currDepth;
		}
		return max;
	}

	/**
	 * calculates maximal activation depth w option
	 * to print activation paths to console
	 */
	public maxActivationDepth(print = false) {
		// TODO: implement the following let allPaths =  johnsonAllPaths()
		let max = 0;
		const inputs = this.graph.nodes(`[neuronType = ${NodeNeuronName.INPUT}]`);
		const inputCount = inputs.length;
		const outputs = this.outputNodes();
		const outputCount = inputs.length;
		for (let i = 0; i < inputCount; i++) {
			const input = inputs[i];
			for (let j = 0; j < outputCount; j++) {
				const out = outputs[j];
				const allPaths = this.allPaths(input, out);
				for (let k = 0; k < allPaths.length; k++) {
					const path = allPaths[k];
					if ((path.length - 1) / 2 > max) max = (path.length - 1) / 2;
				}
			}
		}
		return max;
	}

	public allPaths(root: NodeSingular, target: NodeSingular) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (this.graph.elements() as any).cytoscapeAllPaths({
			rootIds: [root.id()],
			target: target.id()
		}) as (NodeSingular | EdgeSingular)[][];
	}

	static neuronTypeName = (neuronType: NodeNeuronType) => {
		switch (neuronType) {
			case NodeNeuronType.HiddenNeuron:
				return NodeNeuronName.HIDDEN;
			case NodeNeuronType.InputNeuron:
				return NodeNeuronName.INPUT;
			case NodeNeuronType.OutputNeuron:
				return NodeNeuronName.OUTPUT;
			case NodeNeuronType.BiasNeuron:
				return NodeNeuronName.BIAS;
			default:
				return NodeNeuronName.IDK;
		}
	};

	static nodeTypeName = (nType: NNodeType) => {
		switch (nType) {
			case NNodeType.NeuronNode:
				return NodeType.NEURON;
			case NNodeType.SensorNode:
				return NodeType.SENSOR;
			default:
				return NodeType.IDK;
		}
	};

	/**
	 * finds the greatest depth starting from this
	 * neuron at depth d; if maxDepth > 0, it can be used
	 * to stop early in case of very deep network detected
	 */
	public depth(n: NodeSingular, d: number, maxDepth: number) {
		if (maxDepth > 0 && d > maxDepth) {
			/* avoid traversing very deep network */
			console.error(`NNODE: ${n.data()} exceeds max network depth`);
			return maxDepth;
		}

		n.data('visited', true);
		/* base case */
		if (NNode.isSensor(n)) {
			return d;
		} else {
			/* recursion */
			let max = d;
			const inCxns = this.graph.edges(`[target = "${n.id()}"]`);
			const inCxnCount = inCxns.length;
			for (let i = 0; i < inCxnCount; i++) {
				const l = inCxns[i];
				const inNode = this.graph.getElementById(l.data('source'));
				if (inNode.data('visited')) {
					/* skip, already visited (loop detected) */
					continue;
				}
				const curDepth = this.depth(inNode, d + 1, maxDepth);
				if (!curDepth)
					throw new Error(
						`NNODE: ${n.data()} depth error during recursion; failed at l.inNode ${inNode.data()}`
					);
				if (curDepth > max) {
					max = curDepth;
				}
			}
			return max;
		}
	}
}
