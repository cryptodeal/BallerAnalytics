import { WorkerMessageType } from '../utils';

export class ControlsProxy {
	public worker: Worker;
	public elementId: string;
	public htmlElement: HTMLElement;
	public sceneInit = false;

	constructor(worker: Worker, htmlElement: HTMLElement, elementId = 'element') {
		if (!(worker instanceof Worker)) {
			throw new Error(
				'ControlsProxy: the first parameter "worker" is not assignable to type Worker.'
			);
		}

		this.worker = worker;
		this.htmlElement = htmlElement;

		if (htmlElement !== null) {
			if (!(htmlElement instanceof HTMLElement)) {
				throw new Error(
					'ControlsProxy: the second parameter "htmlElement" is not assignable to type HTMLElement.'
				);
			} else {
				this.worker.postMessage({
					type: WorkerMessageType.MAKE_ELEMENT,
					id: elementId
				});
			}
		}
		this.worker = worker;
		this.elementId = elementId;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sendEventMessage(event: { type: string; id: string; event: any }) {
		this.worker.postMessage({
			type: WorkerMessageType.EVENT,
			id: this.elementId,
			event
		});
	}

	initScene(
		drawingSurface: OffscreenCanvas,
		width: number,
		height: number,
		pixelRatio: number,
		darkMode: boolean
	) {
		this.worker.postMessage(
			{
				type: WorkerMessageType.CREATE_INIT,
				id: this.elementId,
				drawingSurface,
				width,
				darkMode,
				height,
				pixelRatio
			},
			[drawingSurface]
		);
		this.sceneInit = true;
	}

	restyle(height: number, width: number, darkMode: boolean) {
		const type = WorkerMessageType.RESTYLE;
		this.worker.postMessage({
			type,
			height,
			width,
			darkMode
		});
	}

	dispose() {
		this.worker.postMessage({
			type: WorkerMessageType.DISPOSE
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static copyProperties(src: any, properties: string[]): any {
		const result = {};
		properties.forEach((key) => {
			result[key] = src[key];
		});
		return result;
	}
}
