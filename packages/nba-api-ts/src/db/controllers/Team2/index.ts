import type { Game2Document, Team2Document } from '../../../index';
import { Player2, Team2 } from '../../../index';
import { getTeamRoster } from '../../../api/bballRef/teams';
import { getPlayerData } from '../../../api/bballRef/player';
import mongoose from 'mongoose';

interface Team2Season {
	year: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	roster: any;
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

export const addGameToTeam = async (
	game: Game2Document,
	team: Team2Document,
	seasonStage?: string
) => {
	const { year } = game.meta.helpers.bballRef;
	const { _id } = game;
	let seasonIndex = team.seasons.findIndex((s) => s.season == year);
	if (seasonIndex == -1 && year) {
		const season: Team2Season = {
			year,
			roster: {},
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
		team.seasons.addToSet(season);
		team = await team.save();
		seasonIndex = team.seasons.findIndex((s) => s.season == year);
	}

	switch (seasonStage) {
		case 'pre': {
			team.seasons[seasonIndex].preseason.games.addToSet(_id);
			break;
		}
		case 'regular': {
			team.seasons[seasonIndex].regularSeason.games.addToSet(_id);
			break;
		}
		case 'post': {
			team.seasons[seasonIndex].postseason.games.addToSet(_id);
			break;
		}
		default: {
			throw Error(`Invalid season stage "${seasonStage}"`);
		}
	}
	return team.save();
};

export const importTeamRoster = async (team: Team2Document, year?: number) => {
	if (year) {
		const i = team.seasons.findIndex((s) => s.season == year);
		if (i == -1) {
			throw Error(`No season found for year ${year}`);
		}
		const rosterData = await getTeamRoster(team.seasons[i].infoCommon.abbreviation, year);
		for (let i = 0; i < rosterData.length; i++) {
			let player = await Player2.findByPlayerUrl(rosterData[i].playerUrl);
			if (!player) {
				const { height, weight, birthDate, birthPlace, position, shoots, name, college, socials } =
					await getPlayerData(rosterData[i].playerUrl);
				player = new Player2({});
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
				player = await player.save();
			}
			team.seasons[i].roster.players.addToSet({
				player: player._id,
				number: rosterData[i].number,
				position: rosterData[i].position,
				twoWay: rosterData[i].twoWay
			});
		}
		return team.save();
	}

	return team.save();
};

export const importTeamRosters = async () => {
	for (const team of await Team2.find()) {
		await importTeamRoster(team);
	}
};
