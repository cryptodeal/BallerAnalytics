/// <reference types="@sveltejs/kit" />

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
