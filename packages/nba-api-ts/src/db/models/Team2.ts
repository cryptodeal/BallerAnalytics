import mongoose from 'mongoose';
import type {
	Team2Document,
	Team2Model,
	Team2Schema,
	Team2Object
} from '../interfaces/mongoose.gen';

/* 
export interface Team2RosterObject extends Team2Object {
  stats: [{
    teamSplits: mongoose.Types.DocumentArray<Player2SeasonRegularSeasonStatsTeamSplitDocument>;
    totals?: Player2SeasonPostseasonStatDocument;
  }];
}
*/

const teamStatsTotalsSchema = new mongoose.Schema(
	{
		fieldGoalsMade: {
			value: { type: Number },
			rank: { type: Number }
		},
		fieldGoalsAttempted: {
			value: { type: Number },
			rank: { type: Number }
		},
		fieldGoalsPct: {
			value: { type: Number },
			rank: { type: Number }
		},
		threePointersMade: {
			value: { type: Number },
			rank: { type: Number }
		},
		threePointersAttempted: {
			value: { type: Number }
		},
		threePointersPct: {
			value: { type: Number },
			rank: { type: Number }
		},
		twoPointFGMade: {
			value: { type: Number },
			rank: { type: Number }
		},
		twoPointFGAttempted: {
			value: { type: Number },
			rank: { type: Number }
		},
		twoPointFGPct: {
			value: { type: Number },
			rank: { type: Number }
		},
		freeThrowsMade: {
			value: { type: Number },
			rank: { type: Number }
		},
		freeThrowsAttempted: {
			value: { type: Number },
			rank: { type: Number }
		},
		freeThrowsPct: {
			value: { type: Number },
			rank: { type: Number }
		},
		offReb: {
			value: { type: Number },
			rank: { type: Number }
		},
		defReb: {
			value: { type: Number },
			rank: { type: Number }
		},
		totalReb: {
			value: { type: Number },
			rank: { type: Number }
		},
		assists: {
			value: { type: Number },
			rank: { type: Number }
		},
		steals: {
			value: { type: Number },
			rank: { type: Number }
		},
		blocks: {
			value: { type: Number },
			rank: { type: Number }
		},
		turnovers: {
			value: { type: Number },
			rank: { type: Number }
		},
		/* TODO: STORE TEAM TURNOVERS AND TOTAL TURNOVERS FROM ESPN */
		personalFouls: {
			value: { type: Number },
			rank: { type: Number }
		},
		points: {
			value: { type: Number },
			rank: { type: Number }
		}
	},
	{ _id: false }
);

const Team2Schema: Team2Schema = new mongoose.Schema({
	meta: {
		helpers: {
			nbaTeamId: { type: String },
			espnTeamId: { type: String }
		},
		isComplete: { type: Boolean, required: true, default: false },
		missingData: [{ type: String, required: false }]
	},
	infoCommon: {
		//seasonYear: {type: String, required: true, default: ''},
		city: { type: String, required: true, default: '' },
		state: { type: String, required: true, default: '' },
		country: { type: String, required: true, default: 'United States' },
		name: { type: String, required: true },
		allNames: [{ type: String, required: false, unique: true }],
		abbreviation: { type: String, required: true },
		nbaAbbreviation: { type: String },
		nickname: { type: String, required: false },
		//key: {type: String, required: false},
		conference: { type: String },
		division: { type: String },
		code: { type: String, required: true },
		slug: { type: String, required: true, index: true },
		minYear: { type: String, required: true },
		maxYear: { type: String, required: true }
	},
	seasons: [
		{
			season: { type: Number, required: true },
			infoCommon: {
				name: { type: String },
				abbreviation: { type: String, required: true },
				city: { type: String },
				slug: { type: String },
				code: { type: String }
			},
			roster: {
				coaches: [
					{
						coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach2', index: true },
						coachType: { type: String, required: true },
						isAssistant: { type: Boolean, required: true }
					}
				],
				players: [
					{
						player: {
							type: mongoose.Schema.Types.ObjectId,
							ref: 'Player2',
							index: true
						},
						number: { type: String },
						position: { type: String },
						twoWay: { type: Boolean, required: true, default: false }
					}
				]
			},
			preseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: teamStatsTotalsSchema
			},
			regularSeason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: teamStatsTotalsSchema
			},
			postseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: teamStatsTotalsSchema
			}
		}
	]
});

Team2Schema.statics = {
	findByName(name: string) {
		return this.findOne({
			$or: [
				{ 'infoCommon.name': name },
				{ 'infoCommon.allNames': name },
				{ 'seasons.infoCommon': { $elemMatch: { name: name } } }
			]
		}).exec();
	},

	async loadTeamPage(slug: string, season: number) {
		return await this.aggregate([
			{
				$match: {
					'infoCommon.slug': slug,
					seasons: {
						$elemMatch: {
							season
						}
					}
				}
			},
			{
				$project: {
					infoCommon: 1,
					seasons: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [
									{
										$eq: ['$$seasons.season', season]
									}
								]
							}
						}
					}
				}
			},
			{
				$lookup: {
					from: 'player2',
					as: 'playerStats',
					let: { playerId: '$seasons.roster.players.player' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [{ $eq: ['$_id', '$$playerId'] }]
								}
							}
						},
						{
							$project: {
								name: 1
							}
						}
					]

					// localField: 'seasons.roster.players.player',
					// foreignField: '_id',
				}
			},
			{
				$project: {
					infoCommon: 1,
					playerStats: 1
				}
			}
		]);
	},

	findByAbbrev(abbrev: string, season: number) {
		return this.findOne({
			seasons: {
				$elemMatch: {
					'infoCommon.abbreviation': abbrev,
					season: season
				}
			}
		})
			.select('_id')
			.exec();
	},

	getAllTeams(): Promise<Team2Object[]> {
		return this.aggregate([
			{
				$match: {
					seasons: {
						$elemMatch: {
							season: 2022
						}
					}
				}
			},
			{
				$project: {
					infoCommon: 1,
					'seasons.season': 1
				}
			},
			{
				$sort: {
					'infoCommon.name': 1
				}
			}
		]).exec();
	},

	getHelperData(): Promise<Team2Object[]> {
		return this.find({
			seasons: {
				$elemMatch: {
					season: 2022
				}
			}
		})
			.select('infoCommon.slug infoCommon.name')
			.lean()
			.exec();
	}
};

Team2Schema.query = {
	populateSznGames(seasonIndex: number) {
		return this.populate({
			path: `seasons.${seasonIndex}.regularSeason.games seasons.${seasonIndex}.postseason.games`,
			select:
				'meta.helpers.isOver home.team home.stats.totals.points visitor.team visitor.stats.totals.points date time',
			populate: {
				path: 'home.team visitor.team',
				select: 'infoCommon.name infoCommon.slug'
			}
		});
	},

	populateSznPlayers(seasonIndex: number) {
		return this.populate(
			`seasons.${seasonIndex}.roster.players.player`,
			'name birthDate meta.images.headshot height weight college seasons.regularSeason.stats seasons.year'
		);
	}
};

export const Team2: Team2Model =
	(mongoose.models.Team2 as Team2Model) ||
	mongoose.model<Team2Document, Team2Model>('Team2', Team2Schema);
