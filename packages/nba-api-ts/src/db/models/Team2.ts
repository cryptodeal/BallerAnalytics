import mongoose from 'mongoose';
import { Team2Document, Team2Model, Team2Queries, Team2Schema } from '../interfaces/mongoose.gen';

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
		slug: { type: String, required: true },
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
						coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach2', index: true, many: true },
						coachType: { type: String, required: true },
						isAssistant: { type: Boolean, required: true }
					}
				],
				players: [
					{
						player: {
							type: mongoose.Schema.Types.ObjectId,
							ref: 'Player2',
							index: true,
							many: true
						},
						number: { type: String, required: true },
						position: { type: String, required: true },
						twoWay: { type: Boolean, required: true, default: false }
					}
				]
			},
			preseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
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
					personalFouls: {
						value: { type: Number },
						rank: { type: Number }
					},
					points: {
						value: { type: Number },
						rank: { type: Number }
					}
				}
			},
			regularSeason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
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
					personalFouls: {
						value: { type: Number },
						rank: { type: Number }
					},
					points: {
						value: { type: Number },
						rank: { type: Number }
					}
				}
			},
			postseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
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
					personalFouls: {
						value: { type: Number },
						rank: { type: Number }
					},
					points: {
						value: { type: Number },
						rank: { type: Number }
					}
				}
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
	}
};

Team2Schema.query = {
	getSeasonBySlug(slug: string, seasonIndex: number) {
		return this.where({ 'infoCommon.slug': slug })
			.select(`infoCommon seasons.season seasons.regularSeason`)
			.populate({
				path: `seasons.${seasonIndex}.regularSeason.games`,
				select:
					'home.team home.stats.totals.points visitor.team visitor.stats.totals.points date time',
				populate: {
					path: 'home.team visitor.team',
					select: 'infoCommon.name infoCommon.slug'
				}
			})
			.lean();
	}
};

export const Team2: Team2Model = mongoose.model<Team2Document, Team2Model, Team2Queries>(
	'Team2',
	Team2Schema
);
