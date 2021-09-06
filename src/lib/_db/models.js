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
			required: true,
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

//PASSWORD BASED AUTHENTICATION
//storing salted and hashed password
/*
    User.pre('save', function(next) {
        let user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password along with our new salt
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        });
    });
  */

//compare the entered password against the salted and hashed password stored in database
/*
    User.methods.comparePassword = function(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    };
  */

const User = mongoose.models.User || mongoose.model('User', userSchema);

export { User };
