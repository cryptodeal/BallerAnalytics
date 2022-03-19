import { init } from './sharedOrbitControls';
import { ProxyManager } from '../proxy/manager';

/* declare worker state management & variables */
self.document = {} as unknown as Document;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;

const proxyManager = new ProxyManager();

function start(data) {
	const proxy = proxyManager.getProxy(data.canvasId);
	proxy.ownerDocument = proxy; // HACK!
	init({
		canvas: data.canvas,
		inputElement: proxy,
		pixelRatio: data.pixelRatio
	});
}

function makeProxy(data) {
	proxyManager.makeProxy(data);
}

const handlers = {
	start,
	makeProxy,
	event: proxyManager.handleEvent
};

ctx.onmessage = function (e) {
	const fn = handlers[e.data.type];
	if (typeof fn !== 'function') {
		throw new Error('no handler for type: ' + e.data.type);
	}
	fn(e.data);
};
