/* eslint-disable @typescript-eslint/no-empty-function */
import { EventDispatcher } from 'three';

function noop() {}

export class ElementProxyReceiver extends EventDispatcher {
	public style;
	public width: number;
	public height: number;
	public left: number;
	public top: number;
	public darkMode: boolean;

	constructor() {
		super();
		// because OrbitControls try to set style.touchAction;
		this.style = {};
	}
	get clientWidth() {
		return this.width;
	}
	get clientHeight() {
		return this.height;
	}

	// OrbitControls call these as of r132. Maybe we should implement them
	setPointerCapture() {}
	releasePointerCapture() {}
	getBoundingClientRect() {
		return {
			left: this.left,
			top: this.top,
			width: this.width,
			height: this.height,
			right: this.left + this.width,
			bottom: this.top + this.height
		};
	}

	handleEvent(data) {
		switch (data.type) {
			case 'size':
				this.left = data.left;
				this.top = data.top;
				this.width = data.width;
				this.height = data.height;
				this.darkMode = data.darkMode;
				return;
			default:
				data.preventDefault = noop;
				data.stopPropagation = noop;
				this.dispatchEvent(data);
				break;
		}
	}
	focus() {
		// no-op
	}
}
