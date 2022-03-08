export type DirectionalShadowOpts = {
	mapSize?: [number, number];
	camera?: {
		left?: number;
		right?: number;
		top?: number;
		bottom?: number;
		near?: number;
		far?: number;
	};
	bias?: number;
	radius?: number;
};
