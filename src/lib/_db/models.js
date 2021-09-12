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
			unique: true,
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
	]
	//seasons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Season', index: true, many: true}]
});

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export { User, Team };
