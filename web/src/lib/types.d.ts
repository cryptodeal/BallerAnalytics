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
