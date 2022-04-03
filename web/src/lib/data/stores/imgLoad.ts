import { writable } from 'svelte/store';

const assetMap: Map<string, boolean> = new Map();
export const imgLoad = writable<Map<string, boolean>>(assetMap);

export class AssetMap {
	public subscribe;
	private _update;
	private _set;
	constructor(path?: string) {
		const { subscribe, set, update } = writable(assetMap);
		this.subscribe = subscribe;
		this._set = set;
		this._update = update;
		if (path) this.initAsset(path);
	}

	public initAsset(path: string) {
		this._update((m) => m.set(path, false));
	}

	public assetLoaded(path: string) {
		this._update((m) => m.set(path, true));
	}

	public isLoaded(path: string) {
		return this.subscribe().get(path);
	}
}
