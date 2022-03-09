import mongoose from 'mongoose';
import { Game2Document, Game2Model, Game2Schema, Game2Object } from '../interfaces/mongoose.gen';

const Game2Schema: Game2Schema = new mongoose.Schema({
	meta: {
		helpers: {
			isOver: { type: Boolean, required: true, index: true },
			nbaGameId: { type: String },
			espnGameId: { type: String },
			bballRef: {
				year: { type: Number, required: true },
				missingData: { type: Boolean, default: false },
				boxScoreUrl: { type: String, required: true, index: true, unique: true }
			}
		},
		status: {
			period: { type: Number },
			displayClock: { type: String },
			clock: { type: Number }
		},
		displaySeason: { type: String, required: true },
		league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true }
	},
	date: { type: Date, required: true, index: true },
	time: { type: Boolean },
	preseason: { type: Boolean, required: true, default: false },
	postseason: { type: Boolean, required: true, default: false },
	arena: { type: String },
	city: { type: String },
	state: { type: String },
	country: { type: String },
	attendance: { type: Number },
	officials: [
		{
			official: { type: mongoose.Schema.Types.ObjectId, ref: 'Official2', index: true },
			jersey_number: { type: String }
		}
	],
	home: {
		team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team2', index: true, required: true },
		score: { type: Number },
		leaders: {
			points: {
				statValue: { type: Number },
				leader: [
					{
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Player2',
						index: true,
						many: true
					}
				]
			},
			assists: {
				statValue: { type: Number },
				leader: [
					{
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Player2',
						index: true,
						many: true
					}
				]
			},
			rebounds: {
				statValue: { type: Number },
				leader: [
					{
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Player2',
						index: true,
						many: true
					}
				]
			}
		},
		stats: {
			totals: {
				fieldGoalsMade: { type: Number },
				fieldGoalsAttempted: { type: Number },
				fieldGoalsPct: { type: Number },
				threePointersMade: { type: Number },
				threePointersAttempted: { type: Number },
				threePointersPct: { type: Number },
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
				fouls: {
					team: { type: Number },
					technical: { type: Number },
					totalTechnical: { type: Number },
					flagrant: { type: Number }
				},
				personalFouls: { type: Number },
				points: { type: Number },
				pointsOffTov: { type: Number },
				fastBreakPoints: { type: Number },
				pointsInPaint: { type: Number },
				largestLead: { type: Number },
				advanced: {
					trueShootingPct: { type: Number },
					effectiveFieldGoalPct: { type: Number },
					threePointAttemptRate: { type: Number },
					freeThrowAttemptRate: { type: Number },
					offRebPct: { type: Number },
					defRebPct: { type: Number },
					totalRebPct: { type: Number },
					assistPct: { type: Number },
					stealPct: { type: Number },
					blockPct: { type: Number },
					turnoverPct: { type: Number },
					offRating: { type: Number },
					defRating: { type: Number },
					pace: { type: Number },
					ftPerFga: { type: Number }
				}
			},
			periods: [
				{
					periodValue: { type: Number, required: true },
					periodName: { type: String, required: true },
					fieldGoalsMade: { type: Number, required: true },
					fieldGoalsAttempted: { type: Number },
					fieldGoalsPct: { type: Number },
					threePointersMade: { type: Number },
					threePointersAttempted: { type: Number },
					threePointersPct: { type: Number },
					freeThrowsMade: { type: Number, required: true },
					freeThrowsAttempted: { type: Number, required: true },
					freeThrowsPct: { type: Number },
					offReb: { type: Number },
					defReb: { type: Number },
					totalReb: { type: Number },
					assists: { type: Number },
					steals: { type: Number },
					blocks: { type: Number },
					turnovers: { type: Number },
					personalFouls: { type: Number, required: true },
					points: { type: Number, required: true }
				}
			]
		},
		players: [
			{
				player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2', index: true },
				jerseyNumber: { type: String },
				positionFull: { type: String },
				positionShort: { type: String },
				active: { type: Boolean, required: true },
				inactive: { type: Boolean, required: true, default: false },
				stats: {
					totals: {
						minutes: { type: Number },
						seconds: { type: Number },
						fieldGoalsMade: { type: Number },
						fieldGoalsAttempted: { type: Number },
						fieldGoalsPct: { type: Number },
						threePointersMade: { type: Number },
						threePointersAttempted: { type: Number },
						threePointersPct: { type: Number },
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
						points: { type: Number },
						plusMinus: { type: Number },
						advanced: {
							trueShootingPct: { type: Number },
							effectiveFieldGoalPct: { type: Number },
							threePointAttemptRate: { type: Number },
							freeThrowAttemptRate: { type: Number },
							offRebPct: { type: Number },
							defRebPct: { type: Number },
							totalRebPct: { type: Number },
							assistPct: { type: Number },
							stealPct: { type: Number },
							blockPct: { type: Number },
							turnoverPct: { type: Number },
							usagePct: { type: Number },
							offRating: { type: Number },
							defRating: { type: Number },
							boxPlusMinus: { type: Number }
						}
					},
					periods: [
						{
							periodValue: { type: Number, required: true },
							periodName: { type: String, required: true },
							active: { type: Boolean, required: true },
							stats: {
								minutes: { type: Number },
								seconds: { type: Number },
								fieldGoalsMade: { type: Number },
								fieldGoalsAttempted: { type: Number },
								fieldGoalsPct: { type: Number },
								threePointersMade: { type: Number },
								threePointersAttempted: { type: Number },
								threePointersPct: { type: Number },
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
								points: { type: Number },
								plusMinus: { type: Number }
							}
						}
					]
				}
			}
		]
	},
	visitor: {
		team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team2', index: true, required: true },
		score: { type: Number },
		leaders: {
			points: {
				statValue: { type: Number },
				leader: [
					{
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Player2',
						index: true,
						many: true
					}
				]
			},
			assists: {
				statValue: { type: Number },
				leader: [
					{
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Player2',
						index: true,
						many: true
					}
				]
			},
			rebounds: {
				statValue: { type: Number },
				leader: [
					{
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Player2',
						index: true,
						many: true
					}
				]
			}
		},
		stats: {
			totals: {
				fieldGoalsMade: { type: Number },
				fieldGoalsAttempted: { type: Number },
				fieldGoalsPct: { type: Number },
				threePointersMade: { type: Number },
				threePointersAttempted: { type: Number },
				threePointersPct: { type: Number },
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
				fouls: {
					team: { type: Number },
					technical: { type: Number },
					totalTechnical: { type: Number },
					flagrant: { type: Number }
				},
				personalFouls: { type: Number },
				points: { type: Number },
				pointsOffTov: { type: Number },
				fastBreakPoints: { type: Number },
				pointsInPaint: { type: Number },
				largestLead: { type: Number },
				advanced: {
					trueShootingPct: { type: Number },
					effectiveFieldGoalPct: { type: Number },
					threePointAttemptRate: { type: Number },
					freeThrowAttemptRate: { type: Number },
					offRebPct: { type: Number },
					defRebPct: { type: Number },
					totalRebPct: { type: Number },
					assistPct: { type: Number },
					stealPct: { type: Number },
					blockPct: { type: Number },
					turnoverPct: { type: Number },
					offRating: { type: Number },
					defRating: { type: Number },
					pace: { type: Number },
					ftPerFga: { type: Number }
				}
			},
			periods: [
				{
					periodValue: { type: Number, required: true },
					periodName: { type: String, required: true },
					fieldGoalsMade: { type: Number, required: true },
					fieldGoalsAttempted: { type: Number },
					fieldGoalsPct: { type: Number },
					threePointersMade: { type: Number },
					threePointersAttempted: { type: Number },
					threePointersPct: { type: Number },
					freeThrowsMade: { type: Number, required: true },
					freeThrowsAttempted: { type: Number, required: true },
					freeThrowsPct: { type: Number },
					offReb: { type: Number },
					defReb: { type: Number },
					totalReb: { type: Number },
					assists: { type: Number },
					steals: { type: Number },
					blocks: { type: Number },
					turnovers: { type: Number },
					personalFouls: { type: Number, required: true },
					points: { type: Number, required: true }
				}
			]
		},
		players: [
			{
				player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2', index: true },
				jerseyNumber: { type: String },
				positionFull: { type: String },
				positionShort: { type: String },
				active: { type: Boolean, required: true },
				inactive: { type: Boolean, required: true, default: false },
				stats: {
					totals: {
						minutes: { type: Number },
						seconds: { type: Number },
						fieldGoalsMade: { type: Number },
						fieldGoalsAttempted: { type: Number },
						fieldGoalsPct: { type: Number },
						threePointersMade: { type: Number },
						threePointersAttempted: { type: Number },
						threePointersPct: { type: Number },
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
						points: { type: Number },
						plusMinus: { type: Number },
						advanced: {
							trueShootingPct: { type: Number },
							effectiveFieldGoalPct: { type: Number },
							threePointAttemptRate: { type: Number },
							freeThrowAttemptRate: { type: Number },
							offRebPct: { type: Number },
							defRebPct: { type: Number },
							totalRebPct: { type: Number },
							assistPct: { type: Number },
							stealPct: { type: Number },
							blockPct: { type: Number },
							turnoverPct: { type: Number },
							usagePct: { type: Number },
							offRating: { type: Number },
							defRating: { type: Number },
							boxPlusMinus: { type: Number }
						}
					},
					periods: [
						{
							periodValue: { type: Number, required: true },
							periodName: { type: String, required: true },
							active: { type: Boolean, required: true },
							stats: {
								minutes: { type: Number },
								seconds: { type: Number },
								fieldGoalsMade: { type: Number },
								fieldGoalsAttempted: { type: Number },
								fieldGoalsPct: { type: Number },
								threePointersMade: { type: Number },
								threePointersAttempted: { type: Number },
								threePointersPct: { type: Number },
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
								points: { type: Number },
								plusMinus: { type: Number }
							}
						}
					]
				}
			}
		]
	}
});

Game2Schema.query = {
	populatePlayers() {
		return this.populate('home.players.player visitor.players.player', 'name.full');
	},

	populateTeams() {
		return this.populate(
			'home.team visitor.team',
			'infoCommon seasons.season seasons.infoCommon meta.helpers.nbaTeamId meta.helpers.espnTeamId'
		);
	}
};

Game2Schema.statics = {
	findByUrl(url: string) {
		return this.findOne({ 'meta.helpers.bballRef.boxScoreUrl': url });
	},

	getDailyGames(startDate: Date, endDate: Date): Promise<Game2Object[]> {
		return this.aggregate([
			{
				$match: {
					date: {
						$gte: startDate,
						$lte: endDate
					}
				}
			},
			{
				$lookup: {
					from: 'team2',
					localField: 'home.team',
					foreignField: '_id',
					as: 'home.team'
				}
			},
			{
				$unwind: '$home.team'
			},
			{
				$lookup: {
					from: 'team2',
					localField: 'visitor.team',
					foreignField: '_id',
					as: 'visitor.team'
				}
			},
			{
				$unwind: '$visitor.team'
			},
			{
				$project: {
					date: 1,
					'meta.helpers': 1,
					'meta.status': 1,
					'visitor.team.infoCommon': 1,
					'visitor.team._id': 1,
					'visitor.score': 1,
					'home.team.infoCommon': 1,
					'home.team._id': 1,
					'home.score': 1
				}
			}
		]).exec();
	},

	async getGames(gameUids: Game2Document['_id'][]): Promise<Game2Object[]> {
		return await this.aggregate([
			{ $match: { _id: { $in: gameUids } } },
			{
				$project: {
					'home.team': 1,
					'home.stats.totals.points': 1,
					'visitor.team': 1,
					'visitor.stats.totals.points': 1,
					date: 1,
					time: 1
				}
			}
		]);
	},

	findMinMaxYears(): Promise<
		{
			_id: null;
			max: Date;
			min: Date;
		}[]
	> {
		return this.aggregate([
			{
				$group: {
					_id: null,
					max: { $max: '$date' },
					min: { $min: '$date' }
				}
			}
		]).exec();
	}
};

export const Game2: Game2Model = mongoose.model<Game2Document, Game2Model>('Game2', Game2Schema);
