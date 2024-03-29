import mongoose from 'mongoose';
import { wrap, plugin, SluggerOptions } from 'mongoose-slugger-plugin';
import { normalizeDiacritics } from 'normalize-text';
import type {
	Player2Document,
	Player2Model,
	Player2Schema,
	Player2Object,
	Player2SeasonPostseasonStatDocument,
	Player2SeasonRegularSeasonStatsTeamSplitDocument,
	PlayerStatTotalModel,
	PlayerStatTotalDocument,
	Game2Object,
	Game2Document,
	StatAdvDocument,
	StatAdvModel
} from '../interfaces/mongoose.gen';

export type Player2Stats = {
	teamSplits: Player2SeasonRegularSeasonStatsTeamSplitDocument[];
	totals?: Player2SeasonPostseasonStatDocument;
	number?: string;
	position?: string;
	twoWay?: boolean;
};

export type Player2StatsObject = Player2Object & {
	stats: [Player2Stats];
};

export type MlFantasyPlayerData = Player2Object & {
	gpSum: number;
	gsSum: number;
	latestGameStats: Game2Object[];
	trainingGameStats: Game2Object[];
};

export type MlFantasyPlayerLean = Player2Object & {
	gpSum: number;
	gsSum: number;
	latestGames: Game2Document['_id'][];
	trainingGames: Game2Document['_id'][];
};

export const PlayerStatTotalsSchema = new mongoose.Schema(
	{
		games: { type: Number },
		gamesStarted: { type: Number },
		minutes: { type: Number },
		fieldGoalsMade: { type: Number },
		fieldGoalsAttempted: { type: Number },
		fieldGoalsPct: { type: Number },
		threePointersMade: { type: Number },
		threePointersAttempted: { type: Number },
		threePointersPct: { type: Number },
		twoPointFGMade: { type: Number },
		twoPointFGAttempted: { type: Number },
		twoPointFGPct: { type: Number },
		effectiveFieldGoalPct: { type: Number },
		freeThrowsMade: { type: Number },
		freeThrowsAttempted: { type: Number },
		freeThrowsPct: { type: Number },
		offReb: { type: Number },
		defReb: { type: Number },
		totalReb: { type: Number },
		assists: { type: Number },
		steals: { type: Number },
		blocks: { type: Number },
		turnovers: { type: Number },
		personalFouls: { type: Number },
		points: { type: Number }
	},
	{ _id: false }
);

export const PlayerStatTotal: PlayerStatTotalModel =
	(mongoose.models.StatTotals as PlayerStatTotalModel) ||
	mongoose.model<PlayerStatTotalDocument, PlayerStatTotalModel>(
		'PlayerStatTotal',
		PlayerStatTotalsSchema
	);

const StatAdvSchema = new mongoose.Schema(
	{
		pEffRate: { type: Number },
		tsPct: { type: Number },
		threePtAttRate: { type: Number },
		ftAttRate: { type: Number },
		offRebPct: { type: Number },
		defRebPct: { type: Number },
		totalRebPct: { type: Number },
		assistPct: { type: Number },
		stlPct: { type: Number },
		blkPct: { type: Number },
		tovPct: { type: Number },
		usgPct: { type: Number },
		offWinShares: { type: Number },
		defWinShares: { type: Number },
		winShares: { type: Number },
		winSharesPer48: { type: Number },
		offBoxPlusMinus: { type: Number },
		defBoxPlusMinus: { type: Number },
		boxPlusMinus: { type: Number },
		valOverBackup: { type: Number }
	},
	{ _id: false }
);

export const StatAdv: StatAdvModel =
	(mongoose.models.StatAdv as StatAdvModel) ||
	mongoose.model<StatAdvDocument, StatAdvModel>('StatAdv', StatAdvSchema);

const Player2Schema: Player2Schema = new mongoose.Schema({
	meta: {
		helpers: {
			missingData: { type: Boolean, default: false },
			espnPlayerId: { type: Number },
			nbaPlayerId: { type: Number },
			bballRef: {
				playerUrl: { type: String, required: true, unique: true }
			}
		},
		slug: { type: String, required: true },
		images: {
			headshot: {
				avif: [{ type: String }],
				png: [{ type: String }],
				webp: [{ type: String }]
			}
		}
	},
	name: {
		full: { type: String, required: true },
		display: { type: String },
		pronunciation: { type: String },
		nicknames: [{ type: String }],
		parsed: [{ type: String }]
	},
	birthDate: { type: Date },
	birthPlace: {
		city: { type: String },
		state: { type: String },
		country: { type: String }
	},
	highSchool: { type: String },
	college: { type: String },
	socials: {
		twitter: { type: String },
		instagram: { type: String }
	},
	height: {
		feet: { type: Number },
		inches: { type: Number }
	},
	weight: { type: Number },
	lastAffiliation: { type: String },
	position: { type: String },
	shoots: { type: String },
	draftYear: { type: String },
	draftRound: { type: String },
	draftNumber: { type: String },
	seasons: [
		{
			year: { type: Number, required: true, index: true },
			teams: [
				{
					id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team2', index: true },
					startDate: { type: Date },
					endDate: { type: Date }
				}
			],
			position: { type: String },
			preseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
					type: PlayerStatTotalsSchema,
					default: () => new PlayerStatTotal()
				}
			},
			regularSeason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
					totals: {
						type: PlayerStatTotalsSchema,
						default: () => new PlayerStatTotal()
					},
					adv: {
						type: StatAdvSchema
					},
					teamSplits: [
						{
							team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team2', required: true },
							totals: {
								type: PlayerStatTotalsSchema,
								default: () => new PlayerStatTotal()
							},
							adv: {
								type: StatAdvSchema,
								default: () => new StatAdv()
							}
						}
					]
				}
			},
			postseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
					type: PlayerStatTotalsSchema,
					default: () => new PlayerStatTotal()
				}
			}
		}
	]
});

Player2Schema.pre('save', function (this: Player2Document, next) {
	if (!this.isModified('name')) {
		next();
	}
	if (this.name.full && this.isModified('name.full')) {
		this.name.full = this.name.full.replace(/\r?\n?\t|\r?\n|\r/g, '').trim();
		const parsedFull = normalizeDiacritics(this.name.full);
		this.name.parsed.addToSet(parsedFull);
	}
	if (this.name.display && this.isModified('name.display')) {
		this.name.display = this.name.display.replace(/\r?\n?\t|\r?\n|\r/g, '').trim();
		const parsedFull = normalizeDiacritics(this.name.display);
		this.name.parsed.addToSet(parsedFull);
	}
	if (this.name.pronunciation && this.isModified('name.pronunciation'))
		this.name.pronunciation = this.name.pronunciation.replace(/\r?\n?\t|\r?\n|\r/g, '').trim();
	if (this.name.nicknames.length > 0 && this.isModified('name.nicknames'))
		this.name.nicknames.map((n) => n.replace(/\r?\n?\t|\r?\n|\r/g, '').trim());
	if (this.name.parsed.length > 0 && this.isModified('name.parsed'))
		this.name.parsed.map((p) => p.replace(/\r?\n?\t|\r?\n|\r/g, '').trim());
	next();
});

Player2Schema.statics = {
	findByPlayerUrl(playerUrl: string) {
		return this.findOne({
			'meta.helpers.bballRef.playerUrl': playerUrl
		}).exec();
	},

	findBySlug(slug: string) {
		return this.findOne({ 'meta.slug': slug });
	},

	async getPlayers(playerUids: Player2Document['_id'][]): Promise<Player2Object[]> {
		return await this.aggregate([
			{ $match: { _id: { $in: playerUids } } },
			{
				$project: {
					name: 1
				}
			}
		]);
	},

	async fantasyData(year: number): Promise<Player2Object[]> {
		return await this.aggregate([
			{
				$match: {
					'seasons.year': {
						$lte: year,
						$gte: 2005
					}
				}
			},
			{
				$project: {
					name: 1,
					birthDate: 1,
					position: 1,
					seasons: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [{ $gte: ['$$seasons.year', 2005] }, { $lte: ['$$seasons.year', year] }]
							}
						}
					}
				}
			},
			{
				$project: {
					name: 1,
					birthDate: 1,
					'seasons.year': 1,
					'seasons.regularSeason.games': 1
				}
			}
		]);
	},

	fantasyDataCount(year: number): Promise<number> {
		return this.countDocuments({
			$and: [
				{
					seasons: {
						$elemMatch: {
							year: year
						}
					}
				},
				{
					seasons: {
						$elemMatch: {
							year: year - 1
						}
					}
				}
			]
		}).exec();
	},

	/* optimized version of the above fantasyData pipeline */
	async fantasyDataPerf(year: number, cursor = 0, limit = 20): Promise<MlFantasyPlayerData[]> {
		return await this.aggregate([
			{
				$match: {
					$and: [
						{
							seasons: {
								$elemMatch: {
									year: year
								}
							}
						},
						{
							seasons: {
								$elemMatch: {
									year: year - 1
								}
							}
						}
					]
				}
			},
			{
				$sort: {
					_id: 1
				}
			},
			{
				$skip: cursor * limit
			},
			{
				$limit: limit
			},
			{
				$project: {
					'name.full': 1,
					birthDate: 1,
					position: 1,
					'seasons.year': 1,
					'seasons.regularSeason.games': 1,
					'seasons.regularSeason.stats.totals': {
						games: 1,
						gamesStarted: 1,
						minutes: 1,
						fieldGoalsMade: 1,
						fieldGoalsAttempted: 1,
						threePointersMade: 1,
						threePointersAttempted: 1,
						freeThrowsMade: 1,
						freeThrowsAttempted: 1,
						offReb: 1,
						defReb: 1,
						totalReb: 1,
						assists: 1,
						steals: 1,
						blocks: 1,
						turnovers: 1,
						points: 1
					}
				}
			},
			{
				$addFields: {
					tempLatestSeason: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [{ $eq: ['$$seasons.year', year] }]
							}
						}
					}
				}
			},
			{
				$project: {
					'name.full': 1,
					birthDate: 1,
					position: 1,
					tempLatestSeason: 1,
					seasons: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [{ $lt: ['$$seasons.year', year] }]
							}
						}
					}
				}
			},
			{
				$lookup: {
					from: 'game2',
					localField: 'tempLatestSeason.regularSeason.games',
					foreignField: '_id',
					as: 'latestGameStats'
				}
			},
			{
				$project: {
					'name.full': 1,
					birthDate: 1,
					position: 1,
					'latestGameStats.meta.helpers.bballRef.year': 1,
					'latestGameStats.home.players.player': 1,
					'latestGameStats.home.players.stats.totals': {
						minutes: 1,
						fieldGoalsMade: 1,
						fieldGoalsAttempted: 1,
						threePointersMade: 1,
						threePointersAttempted: 1,
						freeThrowsMade: 1,
						freeThrowsAttempted: 1,
						offReb: 1,
						defReb: 1,
						totalReb: 1,
						assists: 1,
						steals: 1,
						blocks: 1,
						turnovers: 1,
						points: 1
					},
					/* TODO: optimize filter to reduce response size */
					/*
            {
              $filter: {
                input: '$latestGameStats.home.players',
                as: 'players',
                cond: {
                  $and: [
                    {
                      $eq: ['$$players.player', '$$_id']
                    }
                  ]
                }
              }
            },
          */

					'latestGameStats.visitor.players.player': 1,
					'latestGameStats.visitor.players.stats.totals': {
						minutes: 1,
						fieldGoalsMade: 1,
						fieldGoalsAttempted: 1,
						threePointersMade: 1,
						threePointersAttempted: 1,
						freeThrowsMade: 1,
						freeThrowsAttempted: 1,
						offReb: 1,
						defReb: 1,
						totalReb: 1,
						assists: 1,
						steals: 1,
						blocks: 1,
						turnovers: 1,
						points: 1
					},
					/* TODO: Fix filter to reduce response size */
					/*
            {
              $filter: {
                input: '$latestGameStats.visitor.players',
                as: 'players',
                cond: {
                  $and: [
                    {
                      $eq: ['$$players.player', '$$_id']
                    }
                  ]
                }
              }
            },
          */
					seasons: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [{ $lt: ['$$seasons.year', year] }]
							}
						}
					}
				}
			},
			{
				$addFields: {
					gpSum: {
						$sum: '$seasons.regularSeason.stats.totals.games'
					},
					gsSum: {
						$sum: '$seasons.regularSeason.stats.totals.gamesStarted'
					}
				}
			},
			/* TODO: Needed if fix filters */
			/*
        {
          $project: {
            'name.full': 1,
            'name.display': 1,
            birthDate: 1,
            position: 1,
            gpSum: 1,
            gsSum: 1,
            'latestGameStats.meta.helpers.bballRef.year': 1,
            'latestGameStats.home.players': 1,
            'latestGameStats.visitor.players': 1,
            'seasons.year': 1,
            'seasons.regularSeason.games': 1
          }
        },
      */
			{
				$lookup: {
					from: 'game2',
					localField: 'seasons.regularSeason.games',
					foreignField: '_id',
					as: 'trainingGameStats'
				}
			},
			{
				$project: {
					name: 1,
					birthDate: 1,
					position: 1,
					latestGameStats: 1,
					gpSum: 1,
					gsSum: 1,
					'trainingGameStats.meta.helpers.bballRef.year': 1,
					'trainingGameStats.home.players.player': 1,
					'trainingGameStats.home.players.stats.totals': {
						minutes: 1,
						fieldGoalsMade: 1,
						fieldGoalsAttempted: 1,
						threePointersMade: 1,
						threePointersAttempted: 1,
						freeThrowsMade: 1,
						freeThrowsAttempted: 1,
						offReb: 1,
						defReb: 1,
						totalReb: 1,
						assists: 1,
						steals: 1,
						blocks: 1,
						turnovers: 1,
						points: 1
					},
					/* TODO: Fix filter to reduce response size */
					/*
            {
              $filter: {
                input: '$trainingGameStats.visitor.players',
                as: 'players',
                cond: {
                  $and: [
                    {
                      $eq: ['$$players.player', '$$_id']
                    }
                  ]
                }
              }
            },
          */
					'trainingGameStats.visitor.players.player': 1,
					'trainingGameStats.visitor.players.stats.totals': {
						minutes: 1,
						fieldGoalsMade: 1,
						fieldGoalsAttempted: 1,
						threePointersMade: 1,
						threePointersAttempted: 1,
						freeThrowsMade: 1,
						freeThrowsAttempted: 1,
						offReb: 1,
						defReb: 1,
						totalReb: 1,
						assists: 1,
						steals: 1,
						blocks: 1,
						turnovers: 1,
						points: 1
					}
					/* TODO: Fix filter to reduce response size */
					/*
            {
              $filter: {
                input: '$trainingGameStats.visitor.players',
                as: 'players',
                cond: {
                  $and: [
                    {
                      $eq: ['$$players.player', '$$_id']
                    }
                  ]
                }
              }
            }
          */
				}
			}
			/* TODO: Needed if fix filters */
			/*
        {
          $project: {
            name: 1,
            birthDate: 1,
            position: 1,
            latestGameStats: 1,
            gpSum: 1,
            gsSum: 1,
            'trainingGameStats.home.players': 1,
            'trainingGameStats.visitor.players': 1,
            'trainingGameStats.meta.helpers.bballRef.maxYear': 1
          }
        }
      */
		]);
	},

	/* optimized version of the above fantasyData pipeline */
	async fantasyDataOpt(year: number): Promise<MlFantasyPlayerLean[]> {
		return await this.aggregate([
			{
				$match: {
					$and: [
						{
							seasons: {
								$elemMatch: {
									year: year
								}
							}
						},
						{
							seasons: {
								$elemMatch: {
									year: year - 1
								}
							}
						}
					]
				}
			},
			{
				$project: {
					'name.full': 1,
					birthDate: 1,
					position: 1,
					'seasons.year': 1,
					'seasons.regularSeason.games': 1,
					'seasons.regularSeason.stats.totals': 1
				}
			},
			{
				$addFields: {
					tempLatestSeason: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [{ $eq: ['$$seasons.year', year] }]
							}
						}
					}
				}
			},
			{
				$addFields: {
					latestGames: '$tempLatestSeason.regularSeason.games'
				}
			},
			{
				$unwind: {
					path: '$latestGames'
				}
			},
			{
				$project: {
					'name.full': 1,
					birthDate: 1,
					position: 1,
					latestGames: {
						$concatArrays: ['$latestGames']
					},
					seasons: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [{ $lt: ['$$seasons.year', year] }]
							}
						}
					}
				}
			},
			{
				$addFields: {
					gpSum: {
						$sum: '$seasons.regularSeason.stats.totals.games'
					},
					gsSum: {
						$sum: '$seasons.regularSeason.stats.totals.gamesStarted'
					},
					trainingGames: {
						$reduce: {
							input: '$seasons.regularSeason.games',
							initialValue: [],
							in: { $concatArrays: ['$$value', '$$this'] }
						}
					}
				}
			},
			{
				$project: {
					name: 1,
					birthDate: 1,
					position: 1,
					latestGames: 1,
					trainingGames: 1,
					gpSum: 1,
					gsSum: 1
				}
			}
		]);
	},

	/* optimized version of the above fantasyData pipeline; limit for testing */
	async fantasyDataOptTest(year: number, limit = 50): Promise<MlFantasyPlayerLean[]> {
		return await this.aggregate([
			{
				$match: {
					$and: [
						{
							seasons: {
								$elemMatch: {
									year: year
								}
							}
						},
						{
							seasons: {
								$elemMatch: {
									year: year - 1
								}
							}
						}
					]
				}
			},
			{
				$project: {
					'name.full': 1,
					birthDate: 1,
					position: 1,
					'seasons.year': 1,
					'seasons.regularSeason.games': 1,
					'seasons.regularSeason.stats.totals': 1
				}
			},
			{
				$addFields: {
					tempLatestSeason: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [{ $eq: ['$$seasons.year', year] }]
							}
						}
					}
				}
			},
			{
				$sort: {
					'tempLatestSeason.regularSeason.stats.totals.games': 1,
					'meta.slug': 1
				}
			},
			{
				$limit: limit
			},
			{
				$addFields: {
					latestGames: '$tempLatestSeason.regularSeason.games'
				}
			},
			{
				$unwind: {
					path: '$latestGames'
				}
			},
			{
				$project: {
					'name.full': 1,
					birthDate: 1,
					position: 1,
					latestGames: {
						$concatArrays: ['$latestGames']
					},
					seasons: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [{ $lt: ['$$seasons.year', year] }]
							}
						}
					}
				}
			},
			{
				$addFields: {
					gpSum: {
						$sum: '$seasons.regularSeason.stats.totals.games'
					},
					gsSum: {
						$sum: '$seasons.regularSeason.stats.totals.gamesStarted'
					},
					trainingGames: {
						$reduce: {
							input: '$seasons.regularSeason.games',
							initialValue: [],
							in: { $concatArrays: ['$$value', '$$this'] }
						}
					}
				}
			},
			{
				$project: {
					name: 1,
					birthDate: 1,
					position: 1,
					latestGames: 1,
					trainingGames: 1,
					gpSum: 1,
					gsSum: 1
				}
			}
		]);
	},

	async getPlayerSeasonStats(
		playerUids: Player2Document['_id'][],
		year: number
	): Promise<Player2StatsObject[]> {
		return await this.aggregate([
			{
				$match: {
					_id: {
						$in: playerUids
					}
				}
			},
			{
				$project: {
					name: 1,
					birthDate: 1,
					'meta.images': 1,
					seasons: {
						$filter: {
							input: '$seasons',
							as: 'seasons',
							cond: {
								$and: [
									{
										$eq: ['$$seasons.year', year]
									}
								]
							}
						}
					}
				}
			},
			{
				$addFields: {
					stats: '$seasons.regularSeason.stats'
				}
			},
			{
				$project: {
					name: 1,
					birthDate: 1,
					'meta.images': 1,
					stats: 1
				}
			}
		]);
	},

	findByNameOrNbaId(name: string | string[], nbaId: string) {
		return this.findOne({
			$or: [
				{ 'name.full': Array.isArray(name) ? { $in: name } : name },
				{ 'name.parsed': Array.isArray(name) ? { $in: name } : name },
				{ 'meta.helpers.nbaPlayerId': nbaId }
			]
		}).exec();
	},

	findByNameOrEspnId(name: string | string[], espnId: number) {
		return this.findOne({
			$or: [
				{ 'name.full': Array.isArray(name) ? { $in: name } : name },
				{ 'name.parsed': Array.isArray(name) ? { $in: name } : name },
				{ 'meta.helpers.espnPlayerId': espnId }
			]
		}).exec();
	}
};

Player2Schema.query = {
	paginate(page = 0, limit = 75) {
		return this.limit(limit).skip(page * limit);
	},

	populatSznTeams() {
		return this.populate(
			`seasons.teams.id`,
			'infoCommon.name infoCommon.slug infoCommon.nbaAbbreviation'
		);
	}
};

Player2Schema.index({ 'meta.slug': 1 }, { name: 'slug', unique: true });

Player2Schema.plugin(
	plugin,
	new SluggerOptions({
		slugPath: 'meta.slug',
		generateFrom: ['name.full'],
		index: 'slug'
	})
);

export const Player2: Player2Model = wrap(
	(mongoose.models.Player2 as Player2Model) ||
		mongoose.model<Player2Document, Player2Model>('Player2', Player2Schema)
);
