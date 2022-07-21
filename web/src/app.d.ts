/// <reference types="@sveltejs/kit/types" />
/// <reference types="unplugin-mtl/mtl" />
/// <reference types="unplugin-obj/obj" />

declare module '@sveltejs/pancake';
declare module 'theme-change';

declare namespace App {
	interface Locals {
		user?: {
			id: string;
			email: string;
			scope: string;
			username?: string;
		};
	}

	//interface Platform {}

	interface Session {
		user?: {
			id: string;
			email: string;
			scope: string;
			username?: string;
		};
	}

	//interface Stuff {}
}

declare interface Navigator {
	connection: NetworkInformation;
}
