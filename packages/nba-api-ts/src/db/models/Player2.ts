import mongoose from 'mongoose';
import { wrap, plugin, SluggerOptions } from 'mongoose-slugger-plugin';
import type {
	Player2Document,
	Player2Model,
	Player2Schema,
	Player2Object,
	Player2SeasonPostseasonStatDocument,
	Player2SeasonRegularSeasonStatsTeamSplitDocument
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

const statTotalsSchema = new mongoose.Schema(
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
					type: statTotalsSchema
				}
			},
			regularSeason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
					totals: {
						type: statTotalsSchema
					},
					teamSplits: [
						{
							team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team2', required: true },
							totals: {
								type: statTotalsSchema,
								required: true
							}
						}
					]
				}
			},
			postseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
					type: statTotalsSchema
				}
			}
		}
	]
});

Player2Schema.pre('save', function (this: Player2Document, next) {
	if (!this.isModified('name')) {
		next();
	}
	this.name.full = this.name.full.replace(/\r?\n?\t|\r?\n|\r/g, '').trim();
	if (this.name.display)
		this.name.display = this.name.display.replace(/\r?\n?\t|\r?\n|\r/g, '').trim();
	if (this.name.pronunciation)
		this.name.pronunciation = this.name.pronunciation.replace(/\r?\n?\t|\r?\n|\r/g, '').trim();
	if (this.name.nicknames.length > 0)
		this.name.nicknames.map((n) => n.replace(/\r?\n?\t|\r?\n|\r/g, '').trim());
	if (this.name.parsed.length > 0)
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
			// TODO: use $lookup and $filter to only return total stats for the player for a game
			/*
        {
          $lookup: {
            from: 'game2',
            localField: 'seasons.regularSeason.games',
            foreignField: '_id',
            as: 'seasons.regularSeason.games'
          }
        },
        {
          $unwind: '$seasons.regularSeason.games'
        },
      */
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
