import type { Writable } from 'svelte/store';
import type { Team2Document, Game2Document, mongoose } from '@balleranalytics/nba-api-ts';
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

export interface ValidatedFormData {
	valid: boolean;
	errors: string[];
}

export interface JWTPayload {
	email: string;
	scope: string;
	id: string;
	iat: number;
	exp: number;
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

interface GameScheduleTeam {
	team: Team2Document;
	stats: Game2Document.home.stats | Game2Document.visitor.stats;
}

export interface GameScheduleItem {
	home: GameScheduleTeam;
	visitor: GameScheduleTeam;
	date: Date;
	time: string;
}

export type BooleanStore = {
	isOpen: Writable<boolean>;
	open: () => void;
	close: () => void;
	toggle: () => void;
};

export interface TeamRecord {
	wins: number;
	losses: number;
}

export interface SeasonList {
	season: number;
}

export interface NewUserFormData {
	userId: mongoose.Types.ObjectId;
	name: {
		first: string;
		last: string;
	};
	birthdate: Date;
	subscriptions: {
		teams: mongoose.Types.Array<ObjectId | Team2Document>;
		players: mongoose.Types.Array<ObjectId | Player2Document>;
	};
}
