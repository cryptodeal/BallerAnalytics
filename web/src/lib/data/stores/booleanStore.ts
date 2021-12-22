import { writable } from 'svelte/store';
import type { BooleanStore } from '$lib/types';

export function booleanStore(initial: boolean): BooleanStore {
	const isOpen = writable<boolean>(initial);
	const { set, update } = isOpen;

	return {
		isOpen,
		open: () => set(true),
		close: () => set(false),
		toggle: () => update((n) => !n)
	};
}
