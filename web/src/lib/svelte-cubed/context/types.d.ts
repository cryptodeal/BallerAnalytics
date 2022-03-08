import type { Camera, EventDispatcher, Object3D, Scene, WebGLRenderer } from 'three';

export type RootContext = {
	canvas: HTMLCanvasElement;
	scene: Scene;
	renderer: WebGLRenderer;

	camera: {
		object: Camera;
		callback: (w: number, h: number) => void;
		set: (camera: Camera, callback: (w: number, h: number) => void) => void;
	};

	controls: {
		object: EventDispatcher;
		callback: (camera: Camera, canvas: HTMLCanvasElement) => EventDispatcher;
		set: (callback: (camera: Camera, canvas: HTMLCanvasElement) => EventDispatcher) => void;
	};

	before_render: (fn: () => void) => void;

	invalidate: () => void;
};

export type GroupContext = {
	add: (object: Object3D) => void;
	remove: (object: Object3D) => void;
};

export type ObjectContext = {
	current: import('svelte/store').Writable<Object3D>;
};
