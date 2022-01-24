import { browser } from '$app/env';
import * as THREE from 'three';

const cache = new Map();

export function load(url: string, callback: () => void) {
	if (!browser) return;

	if (cache.has(url)) {
		callback();
	} else {
		cache.set(url, new THREE.TextureLoader().load('/images/example-code-2.png', callback));
	}

	return cache.get(url);
}
