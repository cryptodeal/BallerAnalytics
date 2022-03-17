import { EventDispatcher } from 'three';

/* mock window for web worker */
export class WorkerWindow extends EventDispatcher {
	constructor() {
		super();
	}
}
