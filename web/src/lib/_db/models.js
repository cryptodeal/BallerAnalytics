import mongoose from 'mongoose';
import validator from 'validator';
import crypto from 'crypto';

const Schema = mongoose.Schema;

const refreshToken = new mongoose.Schema({
	token: {
		type: String,
		trim: true
	},
	expiration: {
		type: Date
	},
	issued: {
		type: Date,
		default: Date.now()
	},
	select: false
});

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: [true, 'Email cannot be empty'],
			index: true,
			lowercase: true,
			unique: true,
			trim: true,
			validate: [validator.isEmail, 'Invalid Email Address']
		},
		authLoginToken: {
			type: String,
			select: false
		},
		authLoginExpires: {
			type: Date,
			select: false
		},
		refreshTokens: [refreshToken],
		active: {
			type: Boolean,
			default: true,
			select: false
		},
		username: {
			type: String,
			//unique: true,
			//required: true,
			trim: true
		},
		scope: {
			type: String,
			required: true,
			//TODO: Change default scope to 'user'
			default: 'admin'
		},
		//password: { type: String, required: true },
		subscriptions: [
			{
				type: String,
				required: false
			}
		],
		premiumUser: {
			isPaid: {
				type: Boolean,
				default: false
			},
			subscriptionDate: { type: Date },
			subscriptionEnd: { type: Date }
		},
		//twitter: { type: String },
		bio: { type: Object },
		name: {
			first: { type: String, trim: true },
			last: { type: String, trim: true }
		},
		//TODO: Add User Image
		image: { type: String, required: false }
	},
	{ timestamps: true }
);

userSchema.methods.createAuthToken = function () {
	const authToken = crypto.randomBytes(32).toString('hex');

	this.authLoginToken = crypto.createHash('sha256').update(authToken).digest('hex');

	this.authLoginExpires = Date.now() + 20 * 60 * 1000; // auth token remains valid for 20 minutes

	return authToken;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

const teamSchema = new Schema({
	_id: { type: String, require: true },
	meta: {
		isComplete: { type: Boolean, require: true, default: false },
		missingData: [{ type: String, require: false }]
	},
	infoCommon: {
		seasonYear: { type: String, require: true, default: '' },
		city: { type: String, require: true, default: '' },
		name: { type: String, require: true },
		abbreviation: { type: String, require: true },
		nickname: { type: String, require: false },
		key: { type: String, require: false },
		conference: { type: String, require: true },
		division: { type: String, require: true },
		code: { type: String, require: true },
		slug: { type: String, require: true },
		w: { type: Number, require: true, default: 0 },
		l: { type: Number, require: true, default: 0 },
		pct: { type: Number, require: true, default: 0 },
		confRank: { type: Number, require: true },
		divRank: { type: Number, require: true },
		minYear: { type: String, require: true },
		maxYear: { type: String, require: true }
	},
	seasonRanks: {
		//leagueId: {type: mongoose.Schema.Types.ObjectId, ref: 'League', index: true, many: false},
		//seasonId: {type: mongoose.Schema.Types.ObjectId, ref: 'Season', index: true, many: false},
		leagueId: { type: String, require: true },
		seasonId: { type: String, require: true },
		ptsRank: { type: Number, require: true, default: 0 },
		ptsPg: { type: Number, require: true, default: 0 },
		rebRank: { type: Number, require: true, default: 0 },
		rebPg: { type: Number, require: true, default: 0 },
		astRank: { type: Number, require: true, default: 0 },
		astPg: { type: Number, require: true, default: 0 },
		oppPtsRank: { type: Number, require: true, default: 0 },
		oppPtsPg: { type: Number, require: true, default: 0 }
	},
	teamShooting: {
		gamesPlayed: { type: Number, require: false },
		games: { type: Number, require: false },
		fgaFrequency: { type: Number, require: false },
		fgm: { type: Number, require: false },
		fga: { type: Number, require: false },
		fgPct: { type: Number, require: false },
		efgPct: { type: Number, require: false },
		fg2aFrequency: { type: Number, require: false },
		fG2M: { type: Number, require: false },
		fG2A: { type: Number, require: false },
		fg2Pct: { type: Number, require: false },
		fg3aFrequency: { type: Number, require: false },
		fG3M: { type: Number, require: false },
		fG3A: { type: Number, require: false },
		fg3Pct: { type: Number, require: false }
	},
	availableSeasons: [
		{
			seasonId: { type: String, require: false },
			roster: {
				coaches: [{ type: String, ref: 'Coach', index: true, many: true }],
				players: [{ type: String, ref: 'Player', index: true, many: true }]
			}
		}
	],
	seasons: [
		{
			season: { type: Number, require: true },
			games: {
				preseason: [{ type: String, ref: 'Game', many: true }],
				regularSeason: [{ type: String, ref: 'Game', many: true }],
				postseason: [{ type: String, ref: 'Game', many: true }]
			},
			roster: {
				coaches: [
					{
						coach: { type: String, ref: 'Coach', index: true, many: true },
						coachType: { type: String, require: true },
						isAssistant: { type: Boolean, require: true }
					}
				],
				players: [
					{
						player: { type: String, ref: 'Player', index: true, many: true },
						number: { type: String, require: true },
						position: { type: String, require: true }
					}
				]
			}
		}
	]
});

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

const playerSchema = new Schema({
	_id: { type: Number, require: true },
	team: { type: String, ref: 'Team', index: true },
	meta: {
		isComplete: { type: Boolean, require: true, default: false },
		helpers: {
			bballRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' }
		},
		missingData: [{ type: String, require: false }]
	},
	//possibly replace team with an array of objects, each containing a reference to the Team's _id + start/end date
	//enables lookup of all rosters player has been on incredibly quickly
	//replaces first_name and last_name with name.first and name.last
	name: {
		first: { type: String, require: true, index: true },
		last: { type: String, require: true, index: true },
		fullName: { type: String, require: true, index: true },
		downcaseName: { type: String, require: true, index: true }
	},
	slug: { type: String, require: true, index: true },
	birthdate: { type: Date, require: true },
	school: { type: String, require: true, index: true },
	country: { type: String, require: true },
	lastAffiliation: { type: String, require: true },
	height: { type: String, require: true },
	weight: { type: String, require: true },
	seasonExp: { type: Number, require: true, default: 0 },
	jersey: { type: String, require: true },
	position: { type: String, require: true },
	rosterstatus: { type: String, require: true },
	playedCurrentSeason: { type: Boolean, require: false },
	PlayerCode: { type: String, index: true },
	fromYear: { type: Number, require: true },
	toYear: { type: Number, require: true },
	//dleagueFlag is a string 'N' or 'Y' from nba.com/stats -> transformed to boolean here bc string boolean is bad practice...
	dleagueFlag: { type: Boolean, require: true },
	//nbaFlag is a string 'N' or 'Y' from nba.com/stats -> transformed to boolean here bc string boolean is bad practice...
	nbaFlag: { type: Boolean, require: true },
	gamesPlayedFlag: { type: Boolean, require: true },
	draftYear: { type: String, require: true, index: true },
	draftRound: { type: String, require: true, index: true },
	draftNumber: { type: String, require: true, index: true },
	headlineStats: {
		//season is alias for nba stats 'timeframe'
		season: { type: String, require: false },
		pts: { type: Number, require: false },
		ast: { type: Number, require: false },
		reb: { type: Number, require: false },
		pie: { type: Number, require: false }
	},
	availableSeasons: [{ seasonId: { type: String, require: false } }],
	seasons: [
		{
			season: { type: String, require: true, index: true },
			team: { type: String, ref: 'Team', index: true },
			stats: {
				gamesPlayed: {
					value: { type: Number },
					rank: { type: Number }
				},
				wins: {
					value: { type: Number },
					rank: { type: Number }
				},
				losses: {
					value: { type: Number },
					rank: { type: Number }
				},
				winPct: {
					value: { type: Number },
					rank: { type: Number }
				},
				minutes: {
					value: { type: Number },
					rank: { type: Number }
				},
				fgm: {
					value: { type: Number },
					rank: { type: Number }
				},
				fga: {
					value: { type: Number },
					rank: { type: Number }
				},
				fgPct: {
					value: { type: Number },
					rank: { type: Number }
				},
				fG3M: {
					value: { type: Number },
					rank: { type: Number }
				},
				fG3A: {
					value: { type: Number },
					rank: { type: Number }
				},
				fG3Pct: {
					value: { type: Number },
					rank: { type: Number }
				},
				ftm: {
					value: { type: Number },
					rank: { type: Number }
				},
				fta: {
					value: { type: Number },
					rank: { type: Number }
				},
				ftPct: {
					value: { type: Number },
					rank: { type: Number }
				},
				oreb: {
					value: { type: Number },
					rank: { type: Number }
				},
				dreb: {
					value: { type: Number },
					rank: { type: Number }
				},
				reb: {
					value: { type: Number },
					rank: { type: Number }
				},
				ast: {
					value: { type: Number },
					rank: { type: Number }
				},
				tov: {
					value: { type: Number },
					rank: { type: Number }
				},
				stl: {
					value: { type: Number },
					rank: { type: Number }
				},
				blk: {
					value: { type: Number },
					rank: { type: Number }
				},
				blka: {
					value: { type: Number },
					rank: { type: Number }
				},
				pf: {
					value: { type: Number },
					rank: { type: Number }
				},
				pfd: {
					value: { type: Number },
					rank: { type: Number }
				},
				pts: {
					value: { type: Number },
					rank: { type: Number }
				},
				plusMinus: {
					value: { type: Number },
					rank: { type: Number }
				},
				nbaFantasyPts: {
					value: { type: Number },
					rank: { type: Number }
				},
				dD2: {
					value: { type: Number },
					rank: { type: Number }
				},
				tD3: {
					value: { type: Number },
					rank: { type: Number }
				}
			}
		}
	]
});

const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);

const coachSchema = new Schema({
	_id: { type: Number, require: true },
	//replaces firstName and lastName with name.first and name.last
	name: {
		first: { type: String, require: true, index: true },
		last: { type: String, require: true, index: true },
		full: { type: String, require: true, index: true }
	},
	seasons: [
		{
			season: { type: String, require: true, index: true },
			team: { type: String, ref: 'Team', index: true }
		}
	]
});

const Coach = mongoose.models.Coach || mongoose.model('Coach', coachSchema);

const gameSchema = new Schema({
	_id: { type: String, require: true },
	helpers: {
		year: { type: String, require: true },
		espnGameId: { type: Number, require: true, index: true }
	},
	meta: {
		isComplete: { type: Boolean, require: true, default: false },
		missingData: [{ type: String, require: false }]
	},
	season_meta: {
		calendar_date: { type: String, require: true },
		season_year: { type: String, require: true },
		stats_season_year: { type: String, require: true },
		stats_season_id: { type: String, require: true },
		stats_season_stage: { type: String, require: true },
		roster_season_year: { type: String, require: true },
		schedule_season_year: { type: String, require: true },
		standings_season_year: { type: String, require: true },
		season_id: { type: String, require: true },
		display_year: { type: String, require: true },
		display_season: { type: String, require: true },
		season_stage: { type: String, require: true },
		league_id: { type: String, require: true }
	},
	preseason: { type: Boolean },
	boxscore_data_url: { type: String, require: true },
	game_url: { type: String, require: true },
	season_id: { type: String, require: true, index: true },
	date: { type: String, require: true, index: true },
	time: { type: String, require: true },
	arena: { type: String, require: true, index: true },
	city: { type: String, require: true },
	state: { type: String, require: true },
	country: { type: String, require: true },
	home_start_date: { type: String, require: true },
	home_start_time: { type: String, require: true },
	visitor_start_date: { type: String, require: true },
	visitor_start_time: { type: String, require: true },
	previewAvailable: { type: String, require: true },
	recapAvailable: { type: String, require: true },
	notebookAvailable: { type: String, require: true },
	tnt_ot: { type: String, require: true },
	attendance: { type: String, require: true },
	officials: [
		{
			_id: { type: String, ref: 'Official', index: true, many: true },
			jersey_number: { type: String, require: true }
		}
	],
	ticket: {
		ticket_link: { type: String, require: true }
	},
	broadcasters: { type: Object, require: true },
	period_time: {
		period_value: { type: String, require: true },
		period_status: { type: String, require: true },
		game_status: { type: String, require: true },
		game_clock: { type: String, require: true },
		total_periods: { type: String, require: true },
		period_name: { type: String, require: true }
	},
	visitor: {
		id: { type: String, ref: 'Team', index: true, many: false },
		score: { type: Number, require: true },
		linescores: {
			period: [
				{
					period_value: { type: String, require: true },
					period_name: { type: String, require: true },
					score: { type: Number, require: true }
				}
			]
		},
		Leaders: {
			Points: {
				PlayerCount: { type: String, require: true },
				StatValue: { type: String, require: true },
				leader: [{ type: Number, ref: 'Player', index: true, many: true }]
			},
			Assists: {
				PlayerCount: { type: String, require: true },
				StatValue: { type: String, require: true },
				leader: [{ type: Number, ref: 'Player', index: true, many: true }]
			},
			Rebounds: {
				PlayerCount: { type: String, require: true },
				StatValue: { type: String, require: true },
				leader: [{ type: Number, ref: 'Player', index: true, many: true }]
			}
		},
		stats: {
			points: { type: Number, require: true },
			field_goals_made: { type: Number, require: true },
			field_goals_attempted: { type: Number, require: true },
			field_goals_percentage: { type: Number, require: true },
			free_throws_made: { type: Number, require: true },
			free_throws_attempted: { type: Number, require: true },
			free_throws_percentage: { type: Number, require: true },
			three_pointers_made: { type: Number, require: true },
			three_pointers_attempted: { type: Number, require: true },
			three_pointers_percentage: { type: Number, require: true },
			rebounds_offensive: { type: Number, require: true },
			rebounds_defensive: { type: Number, require: true },
			team_rebounds: { type: Number, require: true },
			assists: { type: Number, require: true },
			fouls: { type: Number, require: true },
			team_fouls: { type: Number, require: true },
			technical_fouls: { type: Number, require: true },
			steals: { type: Number, require: true },
			turnovers: { type: Number, require: true },
			team_turnovers: { type: Number, require: true },
			blocks: { type: Number, require: true },
			short_timeout_remaining: { type: Number, require: true },
			full_timeout_remaining: { type: Number, require: true }
		},
		players: {
			player: [
				{
					_id: { type: Number, ref: 'Player', index: true, many: false },
					jersey_number: { type: String, require: true },
					position_short: { type: String, require: true, default: '' },
					position_full: { type: String, require: true, default: '' },
					minutes: { type: String, require: true, default: '0' },
					seconds: { type: String, require: true, default: '0' },
					points: { type: Number, require: true, default: 0 },
					field_goals_made: { type: Number, require: true, default: 0 },
					field_goals_attempted: { type: Number, require: true, default: 0 },
					free_throws_made: { type: Number, require: true, default: 0 },
					free_throws_attempted: { type: Number, require: true, default: 0 },
					three_pointers_made: { type: Number, require: true, default: 0 },
					three_pointers_attempted: { type: Number, require: true, default: 0 },
					rebounds_offensive: { type: Number, require: true, default: 0 },
					rebounds_defensive: { type: Number, require: true, default: 0 },
					assists: { type: Number, require: true, default: 0 },
					fouls: { type: Number, require: true, default: 0 },
					steals: { type: Number, require: true, default: 0 },
					turnovers: { type: Number, require: true, default: 0 },
					team_turnovers: { type: Number, require: true, default: 0 },
					plus_minus: { type: Number, require: true, default: 0 },
					on_court: { type: String, require: true, default: '0' },
					starting_position: { type: String, require: true, default: '' }
				}
			]
		}
	},
	home: {
		id: { type: String, ref: 'Team', index: true, many: false },
		score: { type: Number, require: true },
		linescores: {
			period: [
				{
					period_value: { type: String, require: true },
					period_name: { type: String, require: true },
					score: { type: Number, require: true }
				}
			]
		},
		Leaders: {
			Points: {
				PlayerCount: { type: String, require: true },
				StatValue: { type: String, require: true },
				leader: [{ type: Number, ref: 'Player', index: true, many: true }]
			},
			Assists: {
				PlayerCount: { type: String, require: true },
				StatValue: { type: String, require: true },
				leader: [{ type: Number, ref: 'Player', index: true, many: true }]
			},
			Rebounds: {
				PlayerCount: { type: String, require: true },
				StatValue: { type: String, require: true },
				leader: [{ type: Number, ref: 'Player', index: true, many: true }]
			}
		},
		stats: {
			points: { type: Number, require: true },
			field_goals_made: { type: Number, require: true },
			field_goals_attempted: { type: Number, require: true },
			field_goals_percentage: { type: Number, require: true },
			free_throws_made: { type: Number, require: true },
			free_throws_attempted: { type: Number, require: true },
			free_throws_percentage: { type: Number, require: true },
			three_pointers_made: { type: Number, require: true },
			three_pointers_attempted: { type: Number, require: true },
			three_pointers_percentage: { type: Number, require: true },
			rebounds_offensive: { type: Number, require: true },
			rebounds_defensive: { type: Number, require: true },
			team_rebounds: { type: Number, require: true },
			assists: { type: Number, require: true },
			fouls: { type: Number, require: true },
			team_fouls: { type: Number, require: true },
			technical_fouls: { type: Number, require: true },
			steals: { type: Number, require: true },
			turnovers: { type: Number, require: true },
			team_turnovers: { type: Number, require: true },
			blocks: { type: Number, require: true },
			short_timeout_remaining: { type: Number, require: true },
			full_timeout_remaining: { type: Number, require: true }
		},
		players: {
			player: [
				{
					_id: { type: Number, ref: 'Player', index: true, many: false },
					jersey_number: { type: String, require: true },
					position_short: { type: String, require: true, default: '' },
					position_full: { type: String, require: true, default: '' },
					minutes: { type: String, require: true, default: '0' },
					seconds: { type: String, require: true, default: '0' },
					points: { type: Number, require: true, default: 0 },
					field_goals_made: { type: Number, require: true, default: 0 },
					field_goals_attempted: { type: Number, require: true, default: 0 },
					free_throws_made: { type: Number, require: true, default: 0 },
					free_throws_attempted: { type: Number, require: true, default: 0 },
					three_pointers_made: { type: Number, require: true, default: 0 },
					three_pointers_attempted: { type: Number, require: true, default: 0 },
					rebounds_offensive: { type: Number, require: true, default: 0 },
					rebounds_defensive: { type: Number, require: true, default: 0 },
					assists: { type: Number, require: true, default: 0 },
					fouls: { type: Number, require: true, default: 0 },
					steals: { type: Number, require: true, default: 0 },
					turnovers: { type: Number, require: true, default: 0 },
					team_turnovers: { type: Number, require: true, default: 0 },
					plus_minus: { type: Number, require: true, default: 0 },
					on_court: { type: String, require: true, default: '0' },
					starting_position: { type: String, require: true, default: '' }
				}
			]
		}
	}
});

const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);

const game2Schema = new Schema({
	meta: {
		helpers: {
			nbaGameId: { type: String },
			espnGameId: { type: String },
			bballRef: {
				year: { type: Number },
				missingData: { type: Boolean, default: false }
			}
		},
		displaySeason: { type: String, required: true },
		league: { type: String, required: true }
	},
	date: { type: Date, required: true },
	time: { type: Boolean },
	preseason: { type: Boolean, required: true, default: false },
	postseason: { type: Boolean, required: true, default: false },
	arena: { type: String },
	city: { type: String },
	state: { type: String },
	country: { type: String },
	officials: [
		{
			official: { type: Schema.Types.ObjectId, ref: 'Official2', index: true },
			jersey_number: { type: String }
		}
	],
	home: {
		team: { type: Schema.Types.ObjectId, ref: 'Team2', index: true },
		score: { type: Number },
		leaders: {
			points: {
				statValue: { type: Number },
				leader: [{ type: Schema.Types.ObjectId, ref: 'Player2', index: true, many: true }]
			},
			assists: {
				statValue: { type: Number },
				leader: [{ type: Schema.Types.ObjectId, ref: 'Player2', index: true, many: true }]
			},
			rebounds: {
				statValue: { type: Number },
				leader: [{ type: Schema.Types.ObjectId, ref: 'Player2', index: true, many: true }]
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
				personalFouls: { type: Number },
				points: { type: Number },
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
					defRating: { type: Number }
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
				player: { type: Schema.Types.ObjectId, ref: 'Player2', index: true },
				jerseyNumber: { type: String },
				positionFull: { type: String },
				positionShort: { type: String },
				active: { type: Boolean, required: true },
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
		team: { type: Schema.Types.ObjectId, ref: 'Team2', index: true },
		score: { type: Number },
		leaders: {
			points: {
				statValue: { type: Number },
				leader: [{ type: Schema.Types.ObjectId, ref: 'Player2', index: true, many: true }]
			},
			assists: {
				statValue: { type: Number },
				leader: [{ type: Schema.Types.ObjectId, ref: 'Player2', index: true, many: true }]
			},
			rebounds: {
				statValue: { type: Number },
				leader: [{ type: Schema.Types.ObjectId, ref: 'Player2', index: true, many: true }]
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
				personalFouls: { type: Number },
				points: { type: Number },
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
					defRating: { type: Number }
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
				player: { type: Schema.Types.ObjectId, ref: 'Player2', index: true },
				jerseyNumber: { type: String },
				positionFull: { type: String },
				positionShort: { type: String },
				active: { type: Boolean, required: true },
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

game2Schema.method('setTeamStats', function (homeTeamStats, visitorTeamStats) {
	this.home.stats = homeTeamStats;
	this.visitor.stats = visitorTeamStats;
});

const Game2 = mongoose.models.Game2 || mongoose.model('Game2', game2Schema);

const player2Schema = new Schema({
	meta: {
		helpers: {
			espnPlayerId: { type: Number },
			nbaPlayerId: { type: Number }
		}
	},
	name: {
		full: { type: String, required: true },
		nicknames: [{ type: String }]
	},
	birthdate: { type: Date },
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
	height: { type: String },
	weight: { type: Number },
	lastAffiliation: { type: String },
	position: { type: String },
	draftYear: { type: String },
	draftRound: { type: String },
	draftNumber: { type: String },
	seasons: [
		{
			year: { type: Number },
			team: { type: Schema.Types.ObjectId, ref: 'Team2', index: true },
			position: { type: String },
			preseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
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
				}
			},
			regularSeason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
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
				}
			},
			postseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
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
				}
			}
		}
	]
});

player2Schema.static('findByName', function (fullName) {
	return this.find({ 'name.full': fullName });
});

const Player2 = mongoose.models.Player2 || mongoose.model('Player2', player2Schema);

const team2Schema = new Schema({
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
				abbreviation: { type: String },
				city: { type: String },
				slug: { type: String },
				code: { type: String }
			},
			roster: {
				coaches: [
					{
						coach: { type: String, ref: 'Coach', index: true, many: true },
						coachType: { type: String, required: true },
						isAssistant: { type: Boolean, required: true }
					}
				],
				players: [
					{
						player: { type: String, ref: 'Player', index: true, many: true },
						number: { type: String, required: true },
						position: { type: String, required: true }
					}
				]
			},
			preseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game', many: true }],
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
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game', many: true }],
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
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game', many: true }],
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

team2Schema.static('findByAbbreviation', function (abbr) {
	return this.find({
		$or: [
			{ 'infoCommon.abbreviation': abbr },
			{ 'seasons.infoCommon': { $elemMatch: { abbreviation: abbr } } }
		]
	});
});

team2Schema.static('findByName', function (name) {
	return this.find({
		$or: [
			{ 'infoCommon.name': name },
			{ 'infoCommon.allNames': name },
			{ 'seasons.infoCommon': { $elemMatch: { name: name } } }
		]
	});
});

const Team2 = mongoose.models.Team2 || mongoose.model('Team2', team2Schema);

export { User, Team, Player, Coach, Game, Game2, Player2, Team2 };
