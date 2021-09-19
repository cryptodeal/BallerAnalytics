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

	this.authLoginExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

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
			season: { type: String, require: true },
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

export { User, Team, Player };
