import { writable } from 'svelte/store';

const createLocalStore = (key: string) => {
	const { subscribe, set, update } = writable();

	return {
		subscribe,
		set,
		update,
		useLocalStorage: () => {
			const json = localStorage.getItem(key);
			if (json) {
				set(json);
			}
			subscribe((current: string) => {
				localStorage.setItem(key, current);
			});
		}
	};
};

// If localStorage has the key then it will be used
// if not the default will be used. Format:
// export const var = createLocalStore(key, default)
export const theme = createLocalStore('theme');
