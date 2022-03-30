import mongoose from 'mongoose';
import crypto from 'crypto';
import type { UserDocument, UserModel, UserSchema } from '../interfaces/mongoose.gen';

const validateEmail = (email: string) => {
	return email.match(
		/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	);
};

const RefreshTokenSchema = new mongoose.Schema({
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
	}
});

const UserSchema: UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: [true, 'Email cannot be empty'],
			index: true,
			lowercase: true,
			unique: true,
			trim: true,
			validate: [validateEmail, 'Invalid Email Address']
		},
		authLoginToken: {
			type: String,
			select: false
		},
		authLoginExpires: {
			type: Date,
			select: false
		},
		refreshTokens: [{ type: RefreshTokenSchema, select: false }],
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
		subscriptions: {
			teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team2', many: true }],
			players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player2', many: true }]
		},
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
		birthdate: { type: Date },
		//TODO: Add User Image
		image: { type: String, required: false }
	},
	{ timestamps: true }
);

UserSchema.methods = {
	createAuthToken() {
		const authToken = crypto.randomBytes(32).toString('hex');
		this.authLoginToken = crypto.createHash('sha256').update(authToken).digest('hex');
		// auth token remains valid for 20 minutes
		this.authLoginExpires = new Date(Date.now() + 20 * 60 * 1000);
		return authToken;
	}
};

export const User: UserModel = mongoose.model<UserDocument, UserModel>('User', UserSchema);
