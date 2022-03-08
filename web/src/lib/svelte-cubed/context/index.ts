import { getContext, setContext, onDestroy } from 'svelte';
import type { RootContext } from './types';
import type { Object3D } from 'three';

const ROOT = {};
const PARENT = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setup(self?: any): { root: RootContext; parent: Object3D; self } {
	const root: RootContext = getContext(ROOT);
	const parent: Object3D = getContext(PARENT) || root.scene;

	if (self) {
		setContext(PARENT, self);

		parent.add(self);

		onDestroy(() => {
			parent.remove(self);
			root.invalidate();
		});
	}

	return {
		root,
		parent,
		self
	};
}

export function get_root(): RootContext {
	return getContext(ROOT);
}

export function set_root(context): RootContext {
	setContext(ROOT, context);
	return context;
}

export function getInvalidator() {
	return get_root().invalidate;
}

export function getCapabilities() {
	return get_root().renderer.capabilities;
}
