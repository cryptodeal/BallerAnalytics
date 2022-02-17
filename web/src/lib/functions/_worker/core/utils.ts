import { DataTexture } from 'three';
import type {
	MTLWorkerListenerEventData,
	WorkerLoadedExtRef,
	WorkerLoaderMessageEventData
} from './types';

export const loadDataTexture = (imageData: ImageData) => {
	const { data, width, height } = imageData;
	const texture = new DataTexture(data, width, height);
	texture.needsUpdate = true;
	return texture;
};

export const isMessageEventDataTest = (obj: unknown): obj is MTLWorkerListenerEventData => {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'mtl' in obj &&
		obj['mtl'] instanceof Uint8Array &&
		'obj' in obj &&
		obj['obj'] instanceof Uint8Array &&
		(('extRefHelpers' in obj && Array.isArray(obj['extRefHelpers'])) ||
			('extRefHelpers' in obj && typeof obj['extRefHelpers'] === 'undefined'))
	);
};

const isWorkerLoadedExtRef = (obj: unknown): obj is WorkerLoadedExtRef => {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'data' in obj &&
		obj['data'] instanceof ArrayBuffer &&
		'width' in obj &&
		typeof obj['width'] === 'number' &&
		'height' in obj &&
		typeof obj['height'] === 'number' &&
		'src' in obj &&
		typeof obj['src'] === 'string'
	);
};

export const isWorkerLoaderMessageEventData = (
	obj: unknown
): obj is WorkerLoaderMessageEventData => {
	return obj !== null && typeof obj === 'object' && Object.values(obj).every(isWorkerLoadedExtRef);
};

export const loadResource = (src: string): Promise<ArrayBuffer> => {
	return fetch(src)
		.then((res) => res.arrayBuffer())
		.catch((err) => {
			throw new Error(`Error: ${err};\nFailed to load resource: ${src}`);
		});
};
