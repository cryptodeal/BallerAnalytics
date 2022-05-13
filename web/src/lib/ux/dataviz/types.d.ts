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
