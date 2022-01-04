import { Game2Document, Team2Document, Player2Document } from '../../interfaces/mongoose.gen';
import { getTeamRoster } from '../../../api/bballRef/teams';
import { Player2 } from '../../models/Player2';
import mongoose from 'mongoose';

interface Team2Season {
	year: number;
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
			const player: Player2Document = await Player2.findByPlayerUrl(rosterData[i].playerUrl);
			team.seasons[i].roster.players.addToSet({
				player: player._id,
				number: rosterData[i].number,
				position: rosterData[i].position,
				twoWay: rosterData[i].twoWay
			});
		}
		return team.save();
	}

	for (let i = 0; i < team.seasons.length; i++) {
		const { season } = team.seasons[i];
		const rosterData = await getTeamRoster(team.seasons[i].infoCommon.abbreviation, season);
		for (let j = 0; j < rosterData.length; j++) {
			const player: Player2Document = await Player2.findByPlayerUrl(rosterData[j].playerUrl);
			team.seasons[i].roster.players.addToSet({
				player: player._id,
				number: rosterData[j].number,
				position: rosterData[j].position,
				twoWay: rosterData[j].twoWay
			});
		}
	}
	return team.save();
};
