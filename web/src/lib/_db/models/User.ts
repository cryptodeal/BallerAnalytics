import mongoose from 'mongoose';
import validator from 'validator';
import crypto from 'crypto';
const RefreshToken = new mongoose.Schema({
	token: {
		type: String,
		trim: true
	},
	expiration: {
		type: Date
	},
	issued: {
		type: Date,
		default: Date.now(),
		required: true
	}
});

const UserSchema = new mongoose.Schema(
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
		refreshTokens: [{ type: RefreshToken, select: false }],
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

UserSchema.methods = {
	createAuthToken() {
		const authToken = crypto.randomBytes(32).toString('hex');

		this.authLoginToken = crypto.createHash('sha256').update(authToken).digest('hex');

		this.authLoginExpires = Date.now() + 20 * 60 * 1000; // auth token remains valid for 20 minutes

		return authToken;
	}
};

export const User = mongoose.model('User', UserSchema);
