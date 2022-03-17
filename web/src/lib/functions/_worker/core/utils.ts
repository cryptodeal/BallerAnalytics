import { DataTexture } from 'three';
import type {
	MTLWorkerListenerEventData,
	WorkerLoadedExtRef,
	WorkerLoaderMessageEventData,
	MTLOffscreenWorkerResizeData,
	MTLOffscreenWorkerEventData
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
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'loadedExtRef' in obj &&
		Object.values(obj['loadedExtRef']).every(isWorkerLoadedExtRef)
	);
};

export const isMTLOffscreenWorkerResizeEvent = (
	obj: unknown
): obj is MTLOffscreenWorkerResizeData => {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'width' in obj &&
		typeof obj['width'] === 'number' &&
		'height' in obj &&
		typeof obj['height'] === 'number' &&
		'darkMode' in obj &&
		typeof obj['darkMode'] === 'boolean' &&
		!('drawingSurface' in obj)
	);
};

export const isMTLOffscreenWorkerEvent = (obj: unknown): obj is MTLOffscreenWorkerEventData => {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'width' in obj &&
		typeof obj['width'] === 'number' &&
		'height' in obj &&
		typeof obj['height'] === 'number' &&
		'darkMode' in obj &&
		typeof obj['darkMode'] === 'boolean' &&
		'drawingSurface' in obj &&
		obj['drawingSurface'] instanceof OffscreenCanvas
	);
};

export const loadResource = (src: string): Promise<ArrayBuffer> => {
	return fetch(src)
		.then((res) => res.arrayBuffer())
		.catch((err) => {
			throw new Error(`Error: ${err};\nFailed to load resource: ${src}`);
		});
};

export enum WorkerMessageType {
	MAKE_ELEMENT = 'make_element',
	CREATE_INIT = 'create_init',
	RESTYLE = 'restyle',
	EVENT = 'event',
	DISPOSE = 'dispose'
}
