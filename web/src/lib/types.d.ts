import type { Types } from 'mongoose';
import type { Writable } from 'svelte/store';
import type { Team2Document, Game2Document, Player2Document } from '@balleranalytics/nba-api-ts';

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
	_id: string;
	home: GameScheduleTeam;
	visitor: GameScheduleTeam;
	date: Date;
	time: string;
	meta: {
		helpers: {
			isOver: boolean;
		};
	};
}

export interface PlayerRosterItem {
	player?: Player2Document;
	number?: string;
	position?: string;
	twoWay: boolean;
	_id: Types.ObjectId;
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
	userId: Types.ObjectId;
	name: {
		first: string;
		last: string;
	};
	birthdate: Date;
	subscriptions: {
		teams: Types.Array<Types.ObjectId | Team2Document>;
		players: Types.Array<Types.ObjectId | Player2Document>;
	};
}

export type MetaGlobImport = Record<
	string,
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	}
>;
