import {
	isMTLOffscreenWorkerResizeEvent,
	isMTLOffscreenWorkerEvent,
	loadResource
} from './core/utils';
import { updateSize, init } from './core/offscreen/scene';
import type {
	MTLOffscreenWorkerEvent,
	MTLOffscreenWorkerResizeEvent,
	WorkerExtRefHelperEvent,
	WorkerLoadedExtRef,
	WorkerLoaderMessageData
} from './core/types';

/* declare worker state management & variables */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any,
	decoder = new TextDecoder('utf-8');

let parsedMtl: string, parsedObj: string;

ctx.addEventListener(
	'message',
	(event: MTLOffscreenWorkerEvent | MTLOffscreenWorkerResizeEvent | WorkerExtRefHelperEvent) => {
		console.log(`worker thread received message:`, event.data);
		const { data } = event;
		if (isMTLOffscreenWorkerResizeEvent(data)) {
			console.log(true, 'resize');
			const { width, height, darkMode } = data;
			updateSize(width, height, darkMode);
		} else if (isMTLOffscreenWorkerEvent(data)) {
			console.log(false, 'init');
			const { drawingSurface, width, height, pixelRatio, obj, mtl, darkMode } = data;
			if (!parsedMtl) parsedMtl = decoder.decode(mtl);
			if (!parsedObj) parsedObj = decoder.decode(obj);
			init(drawingSurface, width, height, darkMode, pixelRatio, parsedObj, parsedMtl);
		} else {
			const { extRefHelpers } = data;
			if (!extRefHelpers.length) ctx.postMessage({});
			return Promise.all(
				extRefHelpers.map(({ src, width, height }) => {
					return loadResource(src).then((data) => {
						return { data, width, height, src };
					});
				})
			).then((res: WorkerLoadedExtRef[]) => {
				const transferrables = res.map(({ data }) => data);
				const finalLoaded: WorkerLoaderMessageData = {};
				for (const { data, height, src, width } of res) {
					finalLoaded[src] = { data, width, height, src };
				}
				return ctx.postMessage({ loadedExtRef: finalLoaded }, transferrables);
			});
		}
	}
);
