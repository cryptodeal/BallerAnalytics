import { ControlsProxy } from './controlsProxy';
import { WorkerMessageType } from '../utils';

const mouseEventProperties = [
	'type',
	'pointerType',
	'button',
	'clientX',
	'clientY',
	'ctrlKey',
	'metaKey',
	'shiftKey'
];
const wheelEventProperties = ['type', 'deltaY'];

const keyboardEventProperties = ['type', 'code'];

const touchEventProperties = ['type'];
const touchProperties = ['pageX', 'pageY'];

export class OrbitControlsProxy extends ControlsProxy {
	constructor(worker: Worker, htmlElement: HTMLElement, elementID = 'element') {
		super(worker, htmlElement, elementID);
	}

	handleResize = () => {
		const rect = this.htmlElement.getBoundingClientRect();
		console.log(rect);
		const fictitiousEvent = {
			type: WorkerMessageType.RESIZE,
			id: this.elementId,
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height
		};
		this.worker.postMessage(fictitiousEvent);
	};

	handlePointerDown = (event: PointerEvent) => {
		event.preventDefault();

		switch (event.pointerType) {
			case 'mouse':
			case 'pen':
				this.handleMouseDown(event);
				break;
			default:
				// TODO touch
				break;
		}
	};

	handlePointerMove = (event: PointerEvent) => {
		event.preventDefault();

		switch (event.pointerType) {
			case 'mouse':
			case 'pen':
				this.handleMouseMove(event);
				break;
			default:
				// TODO touch
				break;
		}
	};

	handlePointerUp = (event: PointerEvent) => {
		event.preventDefault();

		switch (event.pointerType) {
			case 'mouse':
			case 'pen':
				this.handleMouseUp(event);
				break;
			default:
				// TODO touch
				break;
		}
	};

	handleMouseDown = (event: MouseEvent) => {
		// Prevent the browser from scrolling.
		event.preventDefault();

		this.htmlElement.ownerDocument.addEventListener('pointermove', this.handlePointerMove);
		this.htmlElement.ownerDocument.addEventListener('pointerup', this.handlePointerUp);

		const fictitiousEvent = ControlsProxy.copyProperties(event, mouseEventProperties);
		this.sendEventMessage(fictitiousEvent);
	};

	handleMouseMove = (event: MouseEvent) => {
		event.preventDefault();

		const fictitiousEvent = ControlsProxy.copyProperties(event, mouseEventProperties);
		this.sendEventMessage(fictitiousEvent);
	};

	handleMouseUp = (event: MouseEvent) => {
		event.preventDefault();

		this.htmlElement.ownerDocument.removeEventListener('pointermove', this.handlePointerMove);
		this.htmlElement.ownerDocument.removeEventListener('pointerup', this.handlePointerUp);

		const fictitiousEvent = ControlsProxy.copyProperties(event, mouseEventProperties);
		this.sendEventMessage(fictitiousEvent);
	};

	handleWheelEvent = (event: WheelEvent) => {
		event.preventDefault();

		const fictitiousEvent = ControlsProxy.copyProperties(event, wheelEventProperties);
		this.sendEventMessage(fictitiousEvent);
	};

	handleKeyboardEvent = (event: KeyboardEvent) => {
		event.preventDefault();

		const fictitiousEvent = ControlsProxy.copyProperties(event, keyboardEventProperties);
		this.sendEventMessage(fictitiousEvent);
	};

	handleTouchEvent = (event: TouchEvent) => {
		event.preventDefault();

		const fictitiousEvent = ControlsProxy.copyProperties(event, touchEventProperties);

		const touches = [];
		Object.keys(event.touches).forEach((key) => {
			touches.push(ControlsProxy.copyProperties(event.touches[key], touchProperties));
		});
		fictitiousEvent.touches = touches;

		this.sendEventMessage(fictitiousEvent);
	};

	configEventListeners() {
		this.handleResize();
		window.addEventListener('resize', this.handleResize, { capture: true, passive: false });
	}

	dispose() {
		super.dispose();
	}
}
