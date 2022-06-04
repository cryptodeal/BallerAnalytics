import { Network } from './network';
import { NNode } from './network/NNode';
import { NDArray, array } from 'vectorious';
import { getRandomInt } from '../DQN/utils';

export const boolToInt = (b: boolean): number => (b ? 1 : 0);
export const reverseMap = (map: Map<number, any>): Map<number, any> =>
	new Map([...map].reverse().map((v, i) => [i, v]));

export class JohnsonWeightAdjuster {
	public graph: Network;
	public weight?: (xId: number, yId: number) => (number | boolean)[];

	constructor(g: Network, weightFn: (xId: number, yId: number) => (number | boolean)[]) {
		this.graph = g;
		this.weight = weightFn;
	}
}

export class AllShortest {
	nodes: Map<number, NNode> = new Map();
	indexOf: Map<number, number> = new Map();
	dist: NDArray;
	next: Map<number, NDArray> = new Map();
	forward: boolean;

	constructor(nodes: Map<number, NNode>, forward: boolean) {
		if (nodes.size == 0) {
			throw new Error('AllShortest: nodes map is empty');
		}
		this.forward = forward;

		for (const [i, n] of nodes) {
			this.indexOf.set(n.id, i);
		}
		const dim = nodes.size;
		this.dist = new NDArray(new Array(dim * dim).fill(Infinity), {
			shape: [dim, dim]
		});
		const nextSize = dim * dim;
		for (let i = 0; i < nextSize; i++) {
			this.next.set(i, array());
		}
	}

	public at(from: number, to: number) {
		return this.next.get(from + to * this.nodes.size) as NDArray;
	}

	public set(from: number, to: number, weight: number, ...mid: number[]) {
		this.dist.set(from, to, weight);
		this.next.set(from + to * this.nodes.size, array(mid));
	}

	public node(id: number) {
		for (const [, np] of this.nodes) {
			if (np.id == id) {
				return np;
			}
		}
	}

	public add(from: number, to: number, ...mid: number[]) {
		const midSize = mid.length;
		for (let i = 0; i < midSize; i++) {
			const k = mid[i];
			for (const [_, v] of this.next[from + to * this.nodes.size]) {
				if (k == v) {
					continue;
				}
			}
			const val = this.at(from, to);
			val.push(k);
			this.next.set(from + to * this.nodes.size, val);
		}
	}

	public weight(uId: number, vId: number) {
		const from = this.indexOf.get(uId);
		const to = this.indexOf.get(vId);
		if (from == undefined || to == undefined) {
			return Infinity;
		}
		const w = this.dist.get(from, to);
		if (w == Number.NaN) {
			return -Infinity;
		}
		return w;
	}

	public between(
		uId: number,
		vId: number
	): {
		path?: Map<number, NNode>;
		weight: number;
		unique: boolean;
	} {
		let from = this.indexOf.get(uId);
		let to = this.indexOf.get(vId);
		if (!from || !to || this.at(from, to).length == 0) {
			if (uId == vId) {
				if (!from) {
					const path: Map<number, NNode> = new Map();
					path.set(0, this.node(uId) as NNode);
					return { path, weight: 0, unique: true };
				}
				const path: Map<number, NNode> = new Map();
				path.set(0, this.node(from) as NNode);
				return { path, weight: 0, unique: true };
			}
			return { weight: Infinity, unique: false };
		}
		const weight = this.dist.get(from, to);
		if (weight == Number.NaN) {
			return { weight: -Infinity, unique: false };
		}
		const seen = array({ length: this.nodes.size }).fill(-1);
		let n: NNode;
		if (this.forward) {
			n = this.nodes.get(from) as NNode;
			seen.set(from, 0);
		} else {
			n = this.nodes.get(to) as NNode;
			seen.set(to, 0);
		}
		const path: NNode[] = [n];
		let unique = true,
			next: number;
		while (from != to) {
			const c = this.at(from, to);
			if (c.length != 1) {
				unique = false;
				next = c.get(getRandomInt(0, c.length));
			} else {
				next = c.get(0);
			}
			if (seen.get(next) >= 0) {
				path.splice(0, seen.get(next));
			}
			seen.set(next, path.length);
			path.push(this.nodes.get(next) as NNode);
			if (this.forward) {
				from = next;
			} else {
				to = next;
			}
		}
		if (!this.forward) {
			path.reverse();
		}

		return { path: new Map(path.map((node, i) => [i, node])), weight, unique };
	}

	public AllBetween(
		uId: number,
		vId: number
	): { paths?: Map<number, Map<number, NNode>>; weight: number } {
		const from = this.indexOf.get(uId);
		const to = this.indexOf.get(vId);
		if (!from || !to || !this.at(from, to).length) {
			if (uId == vId) {
				if (!from) {
					return {
						paths: new Map([[0, new Map([[0, this.node(uId) as NNode]])]]),
						weight: 0
					};
				}
				return {
					paths: new Map([[0, new Map([[0, this.nodes.get(from) as NNode]])]]),
					weight: 0
				};
			}
			return { weight: Infinity };
		}
		const weight = this.dist.get(from, to);
		if (weight == Number.NaN) {
			return { weight: -Infinity };
		}

		let n: NNode;
		if (this.forward) {
			n = this.nodes.get(from) as NNode;
		} else {
			n = this.nodes.get(to) as NNode;
		}
		const seen = array({ length: this.nodes.size }).fill(Number(false));
		const paths = this.allBetween(from, to, seen, new Map([[0, n]]));
		return { paths, weight };
	}

	public allBetween(
		from: number,
		to: number,
		seen: NDArray,
		path?: Map<number, NNode>,
		paths?: Map<number, Map<number, NNode>>
	): Map<number, Map<number, NNode>> {
		if (!paths) paths = new Map();
		if (this.forward) {
			seen.set(from, Number(true));
		} else {
			seen.set(to, Number(true));
		}
		if (from == to) {
			if (!path) {
				return new Map();
			}
			if (!this.forward) {
				path = reverseMap(path);
			}
			return new Map([[0, path]]);
		}
		let first = true;
		const tempVal = this.at(from, to);
		const size = tempVal.length;
		for (let i = 0; i < size; i++) {
			const n = tempVal.get(i);
			if (seen.get(n)) {
				continue;
			}
			if (first) {
				path = new Map([...(path as Map<number, NNode>)]);
				first = false;
			}
			if (this.forward) {
				from = n;
			} else {
				to = n;
			}
			if (!path) path = new Map();
			path.set(path.size, this.nodes.get(n) as NNode);
			paths = this.allBetween(from, to, seen, path, paths);
		}
		return paths;
	}
}
