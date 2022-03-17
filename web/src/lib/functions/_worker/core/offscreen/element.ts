import { EventDispatcher } from 'three';

/* no operate, for event.preventDefault、event.stopPropagation */
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOperate = () => {};

export class Element extends EventDispatcher {
	public ownerDocument: Element;
	public top: number;
	public left: number;
	public width: number;
	public height: number;

	constructor() {
		super();

		this.ownerDocument = this;

		this.top = 0;
		this.left = 0;
		this.width = 0;
		this.height = 0;
	}

	get clientWidth() {
		return Math.round(this.width);
	}

	get clientHeight() {
		return Math.round(this.height);
	}

	getBoundingClientRect() {
		return {
			top: this.top,
			left: this.left,
			width: this.width,
			height: this.height,
			right: this.left + this.width,
			bottom: this.top + this.height
		};
	}

	focus() {
		//no operate
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	dispatchEvent(event: { type: string; [key: string]: any }) {
		if (event.type === 'resize') {
			this.left = event.left;
			this.top = event.top;
			this.width = event.width;
			this.height = event.height;
			//return
		}

		event.preventDefault = noOperate;
		event.stopPropagation = noOperate;

		super.dispatchEvent(event);
	}
}
