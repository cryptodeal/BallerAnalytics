import { updateSize, init } from './core/offscreen/scene';
import basketball from '$models/test.glb?url';
import type {
	MTLOffscreenWorkerEvent,
	MTLOffscreenWorkerResizeEvent,
	WorkerMouseEvent
} from './core/types';

/* declare worker state management & variables */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;

ctx.addEventListener(
	'message',
	(event: MTLOffscreenWorkerEvent | MTLOffscreenWorkerResizeEvent | WorkerMouseEvent) => {
		// console.log(`worker thread received message:`, event.data);
		const { data } = event;
		switch (data.type) {
			case 'init': {
				console.log('init');
				console.log(basketball);
				const { drawingSurface, width, height, pixelRatio, darkMode } = data;
				init(drawingSurface, width, height, darkMode, pixelRatio, basketball);
				break;
			}
			case 'style': {
				console.log('style');
				const { width, height, darkMode } = data;
				updateSize(width, height, darkMode);
				break;
			}
			case 'mouse': {
				/* TODO: Add Orbit Controls Event Handler */
				//console.log('mouse');
				break;
			}
			default: {
				break;
			}
		}
	}
);
