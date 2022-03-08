export type PrecisionOpts = 'lowp' | 'mediump' | 'highp';
export type PowerPrefOpts = 'default' | 'high-performance' | 'low-power';
export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';
export type Position = [number, number, number];
export type Rotation = [number, number, number, EulerOrder?];
export type Scale = number | [number, number, number];
