/// <reference types="@sveltejs/kit/types" />

declare module '@sveltejs/pancake';

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
