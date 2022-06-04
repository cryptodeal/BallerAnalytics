import { NNode } from './NNode';
import type { Link } from './Link';
import { FastControlNode, FastModularNetworkSolver, FastNetworkLink } from './FastNetwork';
import { array, NDArray } from 'vectorious';
import { NodeActivators, type NodeActivationFactory } from '../math';
import { AllShortest, JohnsonWeightAdjuster } from '../utils';
import { seededRandomInt } from '../../utils';

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

export const nodeTypeName = (nType: NNodeType) => {
	switch (nType) {
		case NNodeType.NeuronNode:
			return NodeType.NEURON;
		case NNodeType.SensorNode:
			return NodeType.SENSOR;
		default:
			return NodeType.IDK;
	}
};

export const neuronTypeName = (neuronType: NodeNeuronType) => {
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

export const neuronTypeByName = (name: string) => {
	switch (name) {
		case NodeNeuronName.HIDDEN:
			return NodeNeuronType.HiddenNeuron;
		case NodeNeuronName.INPUT:
			return NodeNeuronType.InputNeuron;
		case NodeNeuronName.OUTPUT:
			return NodeNeuronType.OutputNeuron;
		case NodeNeuronName.BIAS:
			return NodeNeuronType.BiasNeuron;
		default:
			console.error(`Unknown neuron type name: ${name}`);
	}
};

export const activateNode = (node: NNode, a: NodeActivationFactory) =>
	node.setActivation(
		a.activateByType({
			input: node.activationSum,
			auxParams: node.params,
			aType: node.activationType
		})
	);

export const activateModule = (module: NNode, a: NodeActivationFactory) => {
	const inputs = array({ length: module.inCxns.size }).fill(0);

	for (const [i, v] of module.inCxns) {
		inputs.set(i, v.inNode.getActiveOut());
	}

	const outputs = a.activateModuleByType({
		inputs,
		auxParams: module.params,
		aType: module.activationType
	});
	if (outputs.length !== module.outCxns.size) {
		throw new Error(
			`number of output params ${outputs.length} !== number of output neurons of the module ${module.outCxns.size}`
		);
	}

	/* set outputs */
	const outputCount = outputs.length;
	for (let i = 0; i < outputCount; i++) {
		(module.outCxns.get(i) as Link).outNode.setActivation(outputs[i]);
	}
};

export class Network {
	/* network id */
	public id: number;
	/* name of network */
	public name!: string;
	/* Map of NNodes that output from network */
	public outputs: Map<number, NNode> = new Map();
	/* # of links in the network (-1 means not yet counted) */
	public numLinks = -1;
	/* Map of all nodes in network, except MIMO control nodes */
	public allNodes: Map<number, NNode> = new Map();
	/* Map of NNodes that input into network */
	public inputs: Map<number, NNode>;
	/* Map of NNodes that connect network modules */
	public controlNodes: Map<number, NNode> = new Map();

	/* Map of all nodes in nework, including MIMO control nodes */
	public allNodesMIMO: Map<number, NNode> = new Map();

	/* creates a new network */
	constructor(
		inputs: Map<number, NNode>,
		out: Map<number, NNode>,
		all: Map<number, NNode>,
		netId: number
	) {
		this.id = netId;
		this.inputs = inputs;
		this.outputs = out;
		this.allNodes = all;
		this.allNodesMIMO = all;
	}

	/**
	 * returns all nodes that can be reached
	 * directly from node with given ID
	 */
	public from(id: number) {
		const node = this.nodeWithId(id);
		if (!node) return null;
		const nodes: Map<number, NNode> = new Map();
		for (const [i, l] of node.outCxns) {
			nodes.set(i, l.outNode);
		}
		/**
		 * check control nodes - the control nodes
		 * can have this node as incoming. to clear
		 * demarcation between modules & avoid intersections,
		 * control nodes are not in list of outgoing nodes
		 * of normal node by design.
		 */
		for (const [, cn] of this.controlNodes) {
			for (const [, incoming] of cn.inCxns) {
				if (incoming.inNode.id == id) {
					nodes.set(nodes.size, cn);
					break;
				}
			}
		}
		return nodes;
	}

	/**
	 * returns whether an edge exists between
	 * nodes with IDs xid and yid without considering direction
	 */
	public hasEdgeBetween(xId, yId) {
		return this.edgeBetween(xId, yId, false) != null;
	}

	/**
	 * returns whether an edge exists
	 * between nodes with IDx xId and yId without
	 * regard to direction
	 */
	public edge(uId: number, vId: number) {
		return this.edgeBetween(uId, vId, true);
	}

	/**
	 * returns the weighted edge from u to v
	 * with IDs uId and vId if the edge exists
	 * and null otherwise; node v must be directly
	 * reachable from u as defined by from method
	 */
	public weightedEdge(uId: number, vId: number) {
		return this.edgeBetween(uId, vId, true);
	}

	/**
	 * returns the weight for the edge between x and y
	 * with IDs xId and yId if edge(xId, yId) exists.
	 * If x and y are the same node or there is no joining
	 * edge between the 2 nodes, the weight value returned
	 * is implementation dependent. Weight returns true if
	 * an edge exists between x & y, or if x and y have the
	 * same ID, false otherwise
	 */
	public weight(xId: number, yId: number) {
		const edge = this.edgeBetween(xId, yId, true);
		if (!edge) {
			return [0, false];
		}
		return [edge.cxnWeight, true];
	}

	/**
	 * returns whether an edge exists in the graph
	 * from u to v with IDs uId and vId
	 */
	public hasEdgeFromTo(uId: number, vId: number) {
		const edge = this.edgeBetween(uId, vId, true);
		return edge != null;
	}

	/**
	 * returns all nodes that can reach directly to the
	 * node with given ID; must not return null
	 */
	public to(id: number) {
		const node = this.nodeWithId(id);
		const nodes: Map<number, NNode> = new Map();
		if (!node) return nodes;
		for (const [i, l] of node.inCxns) {
			nodes.set(i, l.inNode);
		}
		/**
		 * check control nodes - control nodes may list this
		 * node as incoming; control nodes aren't listed in
		 * list of inCxns of normal node by design to have
		 * clear demarcation between modules & avoid any intersections
		 */
		const initSize = nodes.size;
		for (const [i, cn] of this.controlNodes) {
			nodes.set(initSize + 0, cn);
			break;
		}
		return nodes;
	}

	public edgeBetween(uId: number, vId: number, directed: boolean) {
		let uNode: NNode | undefined = undefined,
			vNode: NNode | undefined = undefined;
		for (const [, np] of this.allNodes) {
			if (np.id == uId) uNode = np;

			if (np.id == vId) vNode = np;

			/* check if already found - recursive link */
			if (uNode !== undefined && vNode !== undefined) {
				/* no need to iterate further */
				break;
			}
		}

		/* nothing found - return immediately */
		if (uNode == undefined && vNode == undefined) {
			return;
		}

		/* there's chance of the control node on either side of edge - exploring it */
		if (uNode == undefined || vNode == undefined) {
			/**
			 * check control nodes for possible edge;
			 * the control nodes aren't double linked
			 * w normal nodes
			 */
			let cId: number, oId: number;
			if (uNode == undefined) {
				/* possibility of control node on incoming side */
				cId = uId;
				oId = vId;
			} else {
				/* possibility of control node on outgoing side */
				cId = vId;
				oId = uId;
			}
			/**
			 * iterate over control nodes, check that
			 * it has edge to normal node
			 */
			for (const [, cn] of this.controlNodes) {
				if (cn.id !== cId) {
					continue;
				}
				/* check cxns */
				for (const [, inc] of cn.inCxns) {
					if (inc.inNode.id == oId) {
						if (!directed) {
							return inc;
						} else {
							/* ensure control node is on the outgoing side */
							if (uNode !== undefined) {
								return inc;
							} else {
								return;
							}
						}
					}
				}
				for (const [, out] of cn.outCxns) {
					if (out.outNode.id == oId) {
						if (!directed) {
							return out;
						} else {
							/* ensure control node is on incoming side */
							if (vNode !== undefined) {
								return out;
							} else {
								return;
							}
						}
					}
				}
			}
		}
		return;
	}

	public nodeWithId(id: number) {
		for (const [, np] of this.allNodesMIMO) {
			if (np.id == id) {
				return np;
			}
		}
	}

	public johnsonAllPaths() {
		const adjusted = new JohnsonWeightAdjuster(this, this.weight);
		adjusted.weight = this.weight;

		const paths = new AllShortest(this.allNodesMIMO, false);
		let q: number,
			sign = -1;
		while (true) {
			q = sign * seededRandomInt();
			if (!paths.indexOf.get(q)) {
				break;
			}
			sign *= -1;
		}

		//adjusted.adjustBy = new Bellman
	}

	/**
	 * creates fast network solver based on the
	 * architecture of this network; mainly used
	 * for big networks to improve processing speed.
	 */
	public fastNetworkSolver() {
		/* calculate neurons per layer */
		const outputNeuronCount = this.outputs.size;

		/* build bias, input & hidden neuron lists */
		let biasNeuronCount = 0;
		const inList: Map<number, NNode> = new Map();
		const biasList: Map<number, NNode> = new Map();
		const hiddenList: Map<number, NNode> = new Map();
		for (const [, ne] of this.allNodes) {
			switch (ne.neuronType) {
				case NodeNeuronType.BiasNeuron:
					biasNeuronCount += 1;
					biasList.set(biasList.size, ne);
					break;
				case NodeNeuronType.InputNeuron:
					inList.set(inList.size, ne);
					break;
				case NodeNeuronType.HiddenNeuron:
					hiddenList.set(hiddenList.size, ne);
				default:
					throw new Error(`NNODE: ${ne} has Unknown neuron type: ${ne.neuronType}`);
			}
		}
		const inputNeuronCount = inList.size;
		const totalNeuronCount = this.allNodes.size;

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
		inConnects = this.processIncomingCxns(this.outputs, biases, neuronLookup);
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
		for (const [i, cn] of this.controlNodes) {
			/* collect inputs */
			const inputs = array({ length: this.controlNodes.size }).fill(0);
			for (const [j, inp] of cn.inCxns) {
				const inIdx = neuronLookup[inp.inNode.id];
				if (!inIdx)
					throw new Error(
						`failed lookup for input neuron with ID: ${inp.inNode.id} at control neuron: ${cn.id}`
					);
				inputs.set(j, inIdx);
			}

			/* collect outputs */
			const outputs = array({ length: this.controlNodes.size }).fill(0);
			for (const [j, out] of cn.outCxns) {
				const outIdx = neuronLookup[out.outNode.id];
				if (!outIdx)
					throw new Error(
						`failed lookup for output neuron with ID: ${out.outNode.id} at control neuron: ${cn.id}`
					);
				outputs.set(j, outIdx);
			}
			/* build control node */
			modules.set(i, new FastControlNode(inputs, outputs, cn.activationType));
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
		nList: Map<number, NNode>,
		activations: NDArray,
		neuronLookup: Map<number, number>
	) {
		for (const [, ne] of nList) {
			activations.set(ne.id, startIdx);
			neuronLookup.set(ne.id, startIdx);
			startIdx++;
		}
		return startIdx;
	}

	public processIncomingCxns(
		nList: Map<number, NNode>,
		biases: NDArray,
		neuronLookup: Map<number, number>
	) {
		const cxns: Map<number, FastNetworkLink> = new Map();
		for (const [, ne] of nList) {
			const targetIdx = neuronLookup.get(ne.id);
			if (!targetIdx) throw new Error(`failed lookup of source for neuron with ID: ${ne.id}`);
			for (const [, inp] of ne.inCxns) {
				const sourceIdx = neuronLookup.get(inp.inNode.id);
				if (!sourceIdx)
					throw new Error(`failed lookup of source for neuron with ID: ${inp.inNode.id}`);
				if (inp.inNode.neuronType === NodeNeuronType.BiasNeuron) {
					/* store bias for target neuron */
					biases.set(targetIdx, biases.get(targetIdx) + inp.cxnWeight);
				} else {
					/* save cxn */
					const conn = new FastNetworkLink(sourceIdx, targetIdx, inp.cxnWeight);
					cxns.set(cxns.size, conn);
				}
			}
		}
		return cxns;
	}

	/* checks if specified node ID is control node */
	public isControlNode(nid: number) {
		for (const [, cn] of this.controlNodes) {
			if (cn.id == nid) {
				return true;
			}
		}
		return false;
	}

	public flush() {
		let res = true;
		for (const [, node] of this.allNodes) {
			node.flushback();
			if (!node.isFlushedCheck()) {
				/* failed; no need to continue */
				res = false;
				break;
			}
		}
		return res;
	}

	/* prints the values of network outputs to console */
	public printActivation() {
		const outputStr = `Network ${this.name} with ID ${this.id} outputs: (`;
		for (const [i, node] of this.outputs) {
			outputStr + `Output ${i}: ${node}`;
		}
		return outputStr + ')';
	}

	/* prints the values of network inputs to consoles */
	public printInputs() {
		const inputStr = `Network ${this.name} with ID ${this.id} inputs: (`;
		for (const [i, node] of this.inputs) {
			inputStr + `Input ${i}: ${node}`;
		}
		return inputStr + ')';
	}

	/* returns true if at least one output node is not active */
	public outputIsOff() {
		for (const [, node] of this.outputs) {
			if (node.activationsCount == 0) {
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
			for (const [, np] of this.allNodes) {
				if (np.isNeuron()) {
					/* reset activation value */
					np.activationSum = 0.0;

					/**
					 * for each node's incoming connection, add
					 * activity from connection to the activesum
					 */
					for (const [, link] of np.inCxns) {
						/* handle possible time delays */
						if (!link.isTimeDelayed) {
							addAmount = link.cxnWeight * link.inNode.getActiveOut();
							if (link.inNode.isActive || link.inNode.isSensor()) {
								np.isActive = true;
							}
						} else {
							addAmount = link.cxnWeight * link.inNode.getActiveOutTd();
						}
						np.activationSum += addAmount;
					} // end for loop iterating over incoming cxns
				} // end if != SENSOR
			} // end for loop iterating over all nodes

			/* activate all the neuron nodes off their incoming cxns */
			for (const [, np] of this.allNodes) {
				if (np.isNeuron()) {
					/* only activate if some active input came in */
					if (np.isActive) {
						/* run the net activation through an activation fn */
						activateNode(np, NodeActivators);
					}
				}
			}

			/**
			 * activate all MIMO control genes to propagate
			 * activation through genome modules
			 */
			for (const [, cn] of this.controlNodes) {
				cn.isActive = false;
				/* activate control MIMO node as control module */
				activateModule(cn, NodeActivators);
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

	public loadSensors(sensors: NDArray) {
		let counter = 0;
		if (sensors.length == this.inputs.size) {
			/* BIAS value provided as input */
			for (const [, node] of this.inputs) {
				if (node.isSensor()) {
					node.sensorLoad(sensors.get(counter));
					counter += 1;
				}
			}
		} else {
			/* use default BIAS value */
			for (const [, node] of this.inputs) {
				if (node.neuronType === NodeNeuronType.InputNeuron) {
					node.sensorLoad(sensors.get(counter));
					counter += 1;
				} else {
					/* default BIAS value */
					node.sensorLoad(1.0);
				}
			}
		}
	}

	public readOutputs() {
		const outs = array({ length: this.outputs.size }).fill(0);
		for (const [i, o] of this.outputs) {
			outs.set(i, o.activation);
		}
		return outs;
	}

	public nodeCount() {
		if (this.controlNodes.size == 0) {
			return this.allNodes.size;
		} else {
			return this.allNodes.size + this.controlNodes.size;
		}
	}

	public linkCount() {
		this.numLinks = 0;
		for (const [, node] of this.allNodes) {
			this.numLinks += node.inCxns.size;
		}
		if (this.controlNodes.size !== 0) {
			for (const [, node] of this.controlNodes) {
				this.numLinks += node.inCxns.size;
				this.numLinks += node.outCxns.size;
			}
		}
		return this.numLinks;
	}

	/**
	 * returns complexity of this network which
	 * is sum of nodes count and links count
	 */
	public complexity() {
		return this.nodeCount() + this.linkCount();
	}

	/**
	 * checks a POTENTIAL link between given inNode
	 * and outNode to see if it must be recurrent; use
	 * count & thresh to jump out in case of infinite loop
	 */
	public isRecurrent(inNode: NNode, outNode: NNode, count: number, thresh: number) {
		/* count node as visited */
		count++;
		if (count > thresh) {
			/* short out - loop detected */
			return false;
		}

		if (inNode == outNode) {
			return true;
		} else {
			/* check back on all links */
			for (const [, link] of inNode.inCxns) {
				/**
				 * skip links that are already recurrent -
				 * only check back through the forward flow
				 * of signals only
				 */
				if (!link.isRecurrent) {
					if (this.isRecurrent(link.inNode, outNode, count, thresh)) {
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
		/* quick case where no hidden or control nodes */
		if (this.allNodes.size == this.inputs.size + this.outputs.size && this.controlNodes.size == 0) {
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
		if (this.controlNodes.size > 0)
			throw new Error(`maxActivationDepthFast does not support modular networks`);

		/* quick case where no hidden or control nodes */
		if (this.allNodes.size == this.inputs.size + this.outputs.size && this.controlNodes.size == 0) {
			/* only 1 layer depth */
			return 1;
		}

		let max = 0;
		for (const [, node] of this.outputs) {
			const currDepth = node.depth(1, maxDepth); //1 ensures this layer is counted
			if (currDepth > max) max = currDepth;
		}
		return max;
	}

	/**
	 * returns all network nodes including MIMO
	 * control nodes: base nodes + control nodes
	 */
	public allNodeswMIMO() {
		return this.allNodesMIMO;
	}

	/**
	 * returns all nodes in network excluding MIMO
	 * control nodes
	 */
	public baseNodes() {
		return this.allNodes;
	}

	/**
	 * calculates maximal activation depth w option
	 * to print activation paths to console
	 */
	public maxActivationDepth(print = false) {
		// TODO: const allPaths = path.JohnsonAllPaths(this)
	}

	static newModularNetwork(
		input: Map<number, NNode>,
		out: Map<number, NNode>,
		all: Map<number, NNode>,
		control: Map<number, NNode>,
		netId: number
	) {
		const n = new Network(input, out, all, netId);
		n.controlNodes = control;
		const initSize = n.allNodesMIMO.size;
		for (const [i, cn] of control) {
			n.allNodesMIMO.set(initSize + i, cn);
		}
		return n;
	}
}
