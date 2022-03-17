import { InitScene } from './core/offscreen/scene';
import basketball from '$models/test.glb?url';
import { WorkerMessageType } from './core/utils';
import { ElementManager } from './core/offscreen/elementManager';
import { WorkerWindow } from './core/offscreen/workerWindow';
import type {
	MTLOffscreenWorkerEvent,
	MTLOffscreenWorkerResizeEvent,
	WorkerEventMessage,
	MTLOffscreenWorkerEventData,
	WorkerElementMessage
} from '$lib/functions/_worker/core/types';

/* declare worker state management & variables */
self.document = {} as unknown as Document;
self.window = new WorkerWindow() as unknown as Window & typeof globalThis;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;
let animation: InitScene;
const elementManager = new ElementManager();

const handleMakeElement = (data: { type: string; id: string }) => {
	elementManager.makeElement(data.id);
};

const handleCreateInit = (data: MTLOffscreenWorkerEventData) => {
	const { drawingSurface, width, height, pixelRatio, darkMode, id } = data;
	const element = elementManager.getElement(id);
	return InitScene.build(drawingSurface, width, height, darkMode, pixelRatio, basketball, element);
};

const handleEvent = (data: {
	type: string;
	id: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	event: { type: string; [key: string]: any };
}) => {
	const element = elementManager.getElement(data.id);
	element?.dispatchEvent(data.event);
};

ctx.addEventListener(
	'message',
	async (
		event:
			| MTLOffscreenWorkerEvent
			| MTLOffscreenWorkerResizeEvent
			| WorkerEventMessage
			| WorkerElementMessage
	) => {
		// console.log(`worker thread received message:`, event.data);
		const { data } = event;
		switch (data.type) {
			case WorkerMessageType.MAKE_ELEMENT: {
				console.log('make element');
				handleMakeElement(data);
				break;
			}
			case WorkerMessageType.CREATE_INIT: {
				console.log('init');
				console.log(basketball);
				animation = await handleCreateInit(data);
				// animation.animate()
				break;
			}
			case WorkerMessageType.RESTYLE: {
				console.log('style');
				const { width, height, darkMode } = data;
				animation?.restyle(width, height, darkMode);
				break;
			}
			case WorkerMessageType.EVENT: {
				/* TODO: Add Orbit Controls Event Handler */
				handleEvent(data);
				break;
			}
			default: {
				break;
			}
		}
	}
);
