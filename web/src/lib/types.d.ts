import type { Writable } from 'svelte/store';
/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
	user?: {
		id: string;
		email: string;
		scope: string;
		username?: string;
	};
}

export interface PostAuthBody {
	email: string;
}

export interface TeamColor {
	hex: string;
	rgb: [number, number, number];
}

export interface CreatedToken {
	accessToken: string;
	refreshToken: string;
	tokenPayload: string;
}

export type BooleanStore = {
	isOpen: Writable<boolean>;
	open: () => void;
	close: () => void;
	toggle: () => void;
};
