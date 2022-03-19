import { init } from './sharedOrbitControls';
import { ResizeObserver } from 'resize-observer';

const mouseEventHandler = makeSendPropertiesHandler([
	'ctrlKey',
	'metaKey',
	'shiftKey',
	'button',
	'pointerType',
	'clientX',
	'clientY',
	'pageX',
	'pageY'
]);

const wheelEventHandlerImpl = makeSendPropertiesHandler(['deltaX', 'deltaY']);

const keydownEventHandler = makeSendPropertiesHandler([
	'ctrlKey',
	'metaKey',
	'shiftKey',
	'keyCode'
]);

function wheelEventHandler(event, sendFn) {
	event.preventDefault();
	wheelEventHandlerImpl(event, sendFn);
}

function preventDefaultHandler(event) {
	event.preventDefault();
}

function copyProperties(src, properties, dst) {
	for (const name of properties) {
		dst[name] = src[name];
	}
}

function makeSendPropertiesHandler(properties) {
	return function sendProperties(event, sendFn) {
		const data = { type: event.type };
		copyProperties(event, properties, data);
		sendFn(data);
	};
}

function touchEventHandler(event: TouchEvent, sendFn) {
	const touches = [];
	const data = { type: event.type, touches };
	for (let i = 0; i < event.touches.length; ++i) {
		const touch = event.touches[i];
		touches.push({
			pageX: touch.pageX,
			pageY: touch.pageY
		});
	}
	sendFn(data);
}

// The four arrow keys
const orbitKeys = {
	'37': true, // left
	'38': true, // up
	'39': true, // right
	'40': true // down
};
function filteredKeydownEventHandler(event, sendFn) {
	const { keyCode } = event;
	if (orbitKeys[keyCode]) {
		event.preventDefault();
		keydownEventHandler(event, sendFn);
	}
}

let nextProxyId = 0;
class ElementProxy {
	public id: number;
	public worker: Worker;
	constructor(
		element: HTMLCanvasElement,
		worker: Worker,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		eventHandlers: Record<string, (event: Event, sendFn: (data: any) => void) => void>
	) {
		this.id = nextProxyId++;
		this.worker = worker;
		const sendEvent = (data) => {
			this.worker.postMessage({
				type: 'event',
				id: this.id,
				data
			});
		};

		// register an id
		worker.postMessage({
			type: 'makeProxy',
			id: this.id
		});
		sendSize();
		for (const [eventName, handler] of Object.entries(eventHandlers)) {
			element.addEventListener(
				eventName,
				function (event) {
					handler(event, sendEvent);
				},
				{ capture: true, passive: false }
			);
		}

		function sendSize() {
			const rect = element.getBoundingClientRect();
			sendEvent({
				type: 'size',
				left: rect.left,
				top: rect.top,
				width: element.clientWidth,
				height: element.clientHeight
			});
		}
		const ro = new ResizeObserver(sendSize);
		ro.observe(element);
	}
}

export function startWorker(canvas: HTMLCanvasElement, worker: Worker, pixelRatio: number) {
	canvas.focus();
	const offscreen = canvas.transferControlToOffscreen();

	const eventHandlers = {
		contextmenu: preventDefaultHandler,
		mousedown: mouseEventHandler,
		mousemove: mouseEventHandler,
		mouseup: mouseEventHandler,
		pointerdown: mouseEventHandler,
		pointermove: mouseEventHandler,
		pointerup: mouseEventHandler,
		touchstart: touchEventHandler,
		touchmove: touchEventHandler,
		touchend: touchEventHandler,
		wheel: wheelEventHandler,
		keydown: filteredKeydownEventHandler
	};
	const proxy = new ElementProxy(canvas, worker, eventHandlers);
	worker.postMessage(
		{
			type: 'start',
			canvas: offscreen,
			canvasId: proxy.id,
			pixelRatio
		},
		[offscreen]
	);
	console.log('using OffscreenCanvas'); /* eslint-disable-line no-console */
}

export function startMainPage(canvas: HTMLCanvasElement, pixelRatio: number) {
	init({ canvas, inputElement: canvas, pixelRatio });
}

/* 

// TODO: Run this shit in onMount

function main() {   
  const canvas = document.querySelector('#c');
  if (canvas.transferControlToOffscreen) {
    startWorker(canvas);
  } else {
    startMainPage(canvas);
  }
}
*/
