import { User } from '$lib/_db/models';
import signToken from '$lib/_api/auth/signToken';
import cookie from 'cookie';
import crypto from 'crypto';

const refreshAuth = async (cookies) => {
	let refresh = cookies.refreshToken;

	// Get user based on hashed refresh token
	const hashedRefreshToken = crypto.createHash('sha256').update(refresh).digest('hex');

	// Check if user exists with refresh token
	const refreshUser = await User.findOne({
		'refreshTokens.expiration': { $gt: Date.now() },
		'refreshTokens.token': hashedRefreshToken
	});

	// Create new token
	const refreshAuthToken = signToken(refreshUser);

	const accessToken = cookie.serialize('accessToken', refreshAuthToken, {
		httpOnly: true,
		sameSite: import.meta.env.VITE_NODE_ENV == 'production' ? 'none' : 'Lax',
		secure: import.meta.env.VITE_NODE_ENV == 'production' ? true : false,
		path: '/',
		maxAge: 1800
	});

	return accessToken;
};

export default refreshAuth;
