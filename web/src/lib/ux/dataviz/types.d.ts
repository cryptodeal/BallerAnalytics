import { NodeType } from '@balleranalytics/tf-neat';

type CXNGraphLoc = {
	id: number;
	index: number;
	type: NodeType;
	vx: number;
	vy: number;
	x: number;
	y: number;
};

export type CXNGraphData = {
	id: number;
	enabled: boolean;
	source: CXNGraphLoc;
	target: CXNGraphLoc;
	label: string;
};

export type ActivationOpts =
	| 'elu'
	| 'relu'
	| 'relu6'
	| 'selu'
	| 'softmax'
	| 'sigmoid'
	| 'softplus'
	| 'tanh';

export type NodeGraphData = {
	activation?: ActivationOpts;
	type: NodeType;
	id: number;
	index: number;
	label: number;
	vx: number;
	vy: number;
	x;
	y;
};

export type Vector2D = {
	x: number;
	y: number;
};

export type CXNData = {
	id: number;
	enabled: boolean;
	source: Vector2D;
	target: Vector2D;
	label: string;
};

export type NodeData = Vector2D & {
	type: NodeType;
	id: number;
	label: number;
	activation?: ActivationOpts;
};
