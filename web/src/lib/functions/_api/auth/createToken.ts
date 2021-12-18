import crypto from 'crypto';
import signToken from '$lib/functions/_api/auth/signToken';
import { User } from '@balleranalytics/nba-api-ts';
import cookie from 'cookie';
import type { UserDocument } from '@balleranalytics/nba-api-ts';
import type { CreatedToken } from '$lib/types';

const createToken = async (user: UserDocument): Promise<CreatedToken> => {
	const env = import.meta.env.VITE_NODE_ENV;
	if (!env || (env !== 'development' && env !== 'production') || typeof env !== 'string') {
		throw Error(`Error: invalid setting for VITE_NODE_ENV: ${env}`);
	}
	const tokenPayload = await signToken(user);

	//Generate random refresh token
	const refreshTokenPayload = crypto.randomBytes(32).toString('hex');

	const hashedRefreshToken = crypto.createHash('sha256').update(refreshTokenPayload).digest('hex');

	const refreshExp = new Date().setDate(new Date().getDate() + 7);

	await User.findByIdAndUpdate(user._id, {
		$push: {
			refreshTokens: {
				token: hashedRefreshToken,
				expiration: refreshExp
			}
		}
	});

	const accessToken = cookie.serialize('accessToken', tokenPayload, {
		httpOnly: true,
		sameSite: env == 'production' ? 'none' : 'lax',
		secure: env == 'production' ? true : false,
		path: '/',
		maxAge: 1800
	});

	const refreshToken = cookie.serialize('refreshToken', refreshTokenPayload, {
		httpOnly: true,
		sameSite: env == 'production' ? 'none' : 'lax',
		secure: env == 'production' ? true : false,
		path: '/',
		maxAge: 604800
	});

	return { accessToken, refreshToken, tokenPayload };
};

export default createToken;
