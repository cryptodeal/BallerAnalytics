import type { UserDocument } from '@balleranalytics/nba-api-ts';
import jwt from 'jsonwebtoken';
import config from '$lib/_config';

interface JwtClaims {
	email: string;
	scope: string;
	id: string;
	username?: string;
}

const signToken = (user: UserDocument): string => {
	const expiresIn = import.meta.env.VITE_JWT_EXPIRY;
	if (typeof expiresIn !== 'string') {
		throw Error('expiresIn must be a string!');
	}
	const claims: JwtClaims = {
		email: user.email,
		scope: user.scope,
		id: `${user._id}`,
		username: user.username
	};
	return jwt.sign(claims, config.JWT_SECRET, { expiresIn });
};

export default signToken;
