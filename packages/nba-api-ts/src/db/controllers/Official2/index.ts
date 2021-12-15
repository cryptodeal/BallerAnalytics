import { Official2 } from '../../../index';
import { Official2Document, Game2Document } from '../../interfaces/mongoose.gen';
import { ParsedOfficial } from '../../../api/bballRef/games/boxScore';
import mongoose from 'mongoose';

export const addOrFindOfficial = async (official: ParsedOfficial) => {
	const { url, name } = official;
	const result: Official2Document = await Official2.findByUrl(url);
	if (!result) {
		const tempOfficial = {
			meta: {
				helpers: {
					bballRef: {
						officialUrl: url
					}
				}
			},
			name: {
				full: name
			}
		};
		return new Official2(tempOfficial)
			.save()
			.then((tempOfficial) => {
				return tempOfficial;
			})
			.catch((err) => {
				console.trace(err);
			});
	} else {
		return result;
	}
};

interface Official2Season {
	year: number;
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
export const addGameToOfficial = async (
	game: Game2Document,
	official: Official2Document,
	seasonStage: string
) => {
	const { year } = game.meta.helpers.bballRef;
	const { _id } = game;
	let seasonIndex = official.seasons.findIndex((s) => s.year == year);
	if (seasonIndex == -1 && year) {
		const season: Official2Season = {
			year,
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
		official.seasons.addToSet(season);
		official = await official.save();
		seasonIndex = official.seasons.findIndex((s) => s.year == year);
	}

	switch (seasonStage) {
		case 'post': {
			official.seasons[seasonIndex].postseason.games.addToSet(_id);
			break;
		}
		case 'pre': {
			official.seasons[seasonIndex].preseason.games.addToSet(_id);
			break;
		}
		case 'regular': {
			official.seasons[seasonIndex].regularSeason.games.addToSet(_id);
			break;
		}
		default: {
			throw Error(`Invalid season stage "${seasonStage}"`);
		}
	}
	return official.save();
};
