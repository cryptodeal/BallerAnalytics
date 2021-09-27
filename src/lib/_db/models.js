import mongoose from 'mongoose';
import validator from 'validator';
import crypto from 'crypto';

const Schema = mongoose.Schema;
//const bcrypt = require('bcrypt'),
//SALT_WORK_FACTOR = 10;

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
			team: { type: String, ref: 'Team', index: true }
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

export { User, Team, Player, Coach, Game };
