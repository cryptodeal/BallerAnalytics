import { Player2, serverlessConnect } from '../../../index';
import type { Game2Document, Player2Document } from '../../../index';
import { BoxScorePlayer } from '../../../api/bballRef/games/utils';
import type { BballRefPlayerQueryResItem } from '../../../api/bballRef/types';
import { getPlayerData } from '../../../api/bballRef/player';
import mongoose from 'mongoose';
import { IStatsPlayerInfo } from '../../../api/nba/nba';
import type { IEspnTeamPlayersTeamAthlete } from '../../../api/espn/types';
import dayjs from 'dayjs';
import config from '../../../config';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBballRefPlayerQueryItem = (arg: any): arg is BballRefPlayerQueryResItem => {
	return (
		arg &&
		arg.playerUrl &&
		typeof arg.playerUrl == 'string' &&
		arg.name &&
		typeof arg.name == 'string'
	);
};

export const addOrFindPlayer = async (playerData: BoxScorePlayer | BballRefPlayerQueryResItem) => {
	const playerUrl = isBballRefPlayerQueryItem(playerData)
		? playerData.playerUrl
		: playerData.meta.helpers.bballRef.playerUrl;
	const name = isBballRefPlayerQueryItem(playerData) ? playerData.name : playerData.fullName;
	const result: Player2Document = await Player2.findByPlayerUrl(playerUrl);
	if (!result) {
		const player = {
			meta: {
				helpers: {
					bballRef: {
						playerUrl: playerUrl
					}
				}
			},
			name: {
				full: name
			}
		};

		return new Player2(player).save().catch((err) => {
			console.log(playerData);
			console.trace(err);
		});
	} else {
		return result;
	}
};

export const addPlayerBasicData = (player: Player2Document): Promise<Player2Document> => {
	const { playerUrl } = player.meta.helpers.bballRef;
	return getPlayerData(playerUrl).then((data) => {
		const { height, weight, birthDate, birthPlace, position, shoots, name, college, socials } =
			data;
		if (height.feet) {
			player.height = {
				feet: height.feet
			};
		}
		if (height.inches) player.height.inches = height.inches;
		if (weight) player.weight = weight;
		if (birthDate) player.birthDate = birthDate;
		if (birthPlace) player.birthPlace = birthPlace;
		if (name.pronunciation) player.name.pronunciation = name.pronunciation;
		if (name.display) player.name.display = name.display;
		if (position) player.position = position;
		if (shoots) player.shoots = shoots;
		if (name?.display) player.name.display = name.display;
		if (college) player.college = college;
		if (socials?.twitter) player.socials.twitter = socials.twitter;
		if (socials?.instagram) player.socials.instagram = socials.instagram;
		return player.save().then((player) => {
			return player;
		});
	});
};

interface Player2Season {
	year: number;
	teams: mongoose.Types.ObjectId[];
	preseason: {
		games: mongoose.Types.ObjectId[];
	};
	regularSeason: {
		games: mongoose.Types.ObjectId[];
	};
	postseason: {
		games: mongoose.Types.ObjectId[];
	};
}

export const addGameToPlayer = async (
	game: Game2Document,
	player: Player2Document,
	seasonStage?: string
) => {
	const { year } = game.meta.helpers.bballRef;
	const { _id } = game;
	let seasonIndex = player.seasons.findIndex((s) => s.year == year);
	if (seasonIndex == -1 && year) {
		const season: Player2Season = {
			year,
			teams: [],
			preseason: {
				games: []
			},
			regularSeason: {
				games: []
			},
			postseason: {
				games: []
			}
		};
		player.seasons.addToSet(season);
		player = await player.save();
		seasonIndex = player.seasons.findIndex((s) => s.year == year);
	}

	switch (seasonStage) {
		case 'post': {
			player.seasons[seasonIndex].postseason.games.addToSet(_id);
			break;
		}
		case 'pre': {
			player.seasons[seasonIndex].preseason.games.addToSet(_id);
			break;
		}
		case 'regular': {
			player.seasons[seasonIndex].regularSeason.games.addToSet(_id);
			break;
		}
		default: {
			throw Error(`Invalid season stage "${seasonStage}"`);
		}
	}
	return player.save();
};

export const compareNbaPlayerBday = (
	nbaPlayerInfo: IStatsPlayerInfo,
	playerDocs: Player2Document[]
): Player2Document => {
	const { birthdate, personId, firstName, lastName } = nbaPlayerInfo.commonPlayerInfo[0];

	const nbaPlayerBday = dayjs(birthdate);
	for (let i = 0; i < playerDocs.length; i++) {
		if (nbaPlayerBday.isSame(dayjs(playerDocs[i].birthDate), 'day')) {
			return playerDocs[i];
		}
	}
	throw Error(`Could not player match for nbaId: ${personId}, name: ${firstName} ${lastName}`);
};

export const compareEspnPlayerBday = (
	espnPlayerInfo: IEspnTeamPlayersTeamAthlete,
	playerDocs: Player2Document[]
): Player2Document => {
	const { dateOfBirth, fullName, id } = espnPlayerInfo;

	const nbaPlayerBday = dayjs(dateOfBirth);
	for (let i = 0; i < playerDocs.length; i++) {
		if (nbaPlayerBday.isSame(dayjs(playerDocs[i].birthDate), 'day')) {
			return playerDocs[i];
		}
	}
	throw Error(`Could not player match for espnId: ${id}, name: ${fullName}`);
};

export const findMatchingBballRefPlayers = async (
	playerQueries: BballRefPlayerQueryResItem[]
): Promise<Player2Document[]> => {
	const players: Player2Document[] = [];
	for (let i = 0; i < playerQueries.length; i++) {
		let player = await addOrFindPlayer(playerQueries[i]);
		if (!player) throw Error(`Player not found in db. Full Name: ${playerQueries[i].name}`);
		player = await addPlayerBasicData(player);
		players.push(player);
	}
	return players;
};
