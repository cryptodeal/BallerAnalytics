import { Game2Document, Team2Document } from '../../interfaces/mongoose.gen';
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
