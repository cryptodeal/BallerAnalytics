import { Player2 } from '@balleranalytics/nba-api-ts';
import { getMinMaxSeasons } from '../games';

import type {
	Player2Document,
	Player2SeasonPostseasonStatDocument,
	Player2SeasonDocument,
	Player2Stats
} from '@balleranalytics/nba-api-ts';

export type PlayersQueryRes = {
	players: Player2Document[];
	query: {
		year?: number;
		name?: string;
	};
};
export const getSeasonPlayers = (
	page: number,
	year: number,
	name?: string
): Promise<[PlayersQueryRes, { min: number; max: number }]> => {
	if (name) {
		return Promise.all([
			Player2.find({
				seasons: { $elemMatch: { year: year } },
				$or: [
					{ 'name.full': { $regex: name, $options: 'i' } },
					{ 'name.display': { $regex: name, $options: 'i' } },
					{ 'name.parsed': { $elemMatch: { $regex: name, $options: 'i' } } },
					{ 'name.nicknames': { $elemMatch: { $regex: name, $options: 'i' } } }
				]
			})
				.select('name.full meta.images meta.slug')
				.sort('name.full')
				.paginate(page)
				.lean()
				.exec()
				.then((players) => {
					return { players, query: { year, name } };
				}),
			getMinMaxSeasons()
		]);
	}
	return Promise.all([
		Player2.find({ seasons: { $elemMatch: { year: year } } })
			.select('name.full meta.images meta.slug')
			.sort('name.full')
			.paginate(page)
			.lean()
			.exec()
			.then((players) => {
				return { players, query: { year, name } };
			}),
		getMinMaxSeasons()
	]);
};

export const getPlayerBySlug = (slug: string): Promise<Player2Document> => {
	return Player2.findBySlug(slug)
		.populatSznTeams()
		.lean()
		.exec()
		.then((player: Player2Document | null) => {
			if (!player) throw new Error(`Player with slug ${slug} not found`);
			const formatPlayerStats = (
				sznIdx: number,
				seasons: Player2SeasonDocument[]
			): Player2Stats => {
				/* If player was on roster, but didn't play populate totals w undefined */
				const totals = {
					games: undefined,
					gamesStarted: undefined,
					minutes: undefined,
					fieldGoalsMade: undefined,
					fieldGoalsAttempted: undefined,
					fieldGoalsPct: undefined,
					threePointersMade: undefined,
					threePointersAttempted: undefined,
					threePointersPct: undefined,
					twoPointFGMade: undefined,
					twoPointFGAttempted: undefined,
					twoPointFGPct: undefined,
					effectiveFieldGoalPct: undefined,
					freeThrowsMade: undefined,
					freeThrowsAttempted: undefined,
					freeThrowsPct: undefined,
					offReb: undefined,
					defReb: undefined,
					totalReb: undefined,
					assists: undefined,
					steals: undefined,
					blocks: undefined,
					turnovers: undefined,
					personalFouls: undefined,
					points: undefined
				} as Player2SeasonPostseasonStatDocument;

				let stats: Player2Stats;
				if (sznIdx !== -1) {
					stats = seasons[sznIdx].regularSeason.stats;
					if (!stats.totals) stats.totals = totals;
					stats.teamSplits.map((split) => {
						if (!split.totals) split.totals = totals;
						return split;
					});
				} else {
					stats = {
						totals,
						teamSplits: []
					};
				}

				return stats;
			};
			player.seasons.map((s, i) => {
				const { teamSplits, totals } = formatPlayerStats(i, player.seasons);
				if (!s.regularSeason.stats.totals) s.regularSeason.stats.totals = totals;
				s.regularSeason.stats.teamSplits.map((split, j) => {
					if (split.totals !== teamSplits[j].totals) split.totals = teamSplits[j].totals;
					return split;
				});
				return s;
			});
			player.seasons.sort((a, b) => a.year - b.year);
			return player;
		});
};
