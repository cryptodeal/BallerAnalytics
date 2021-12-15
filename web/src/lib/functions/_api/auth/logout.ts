import cookie from 'cookie';
import { User } from '@balleranalytics/nba-api-ts';

const logout = async (locals) => {
	console.log(locals);
	const env = import.meta.env.VITE_NODE_ENV;
	if (!env || (env !== 'development' && env !== 'production') || typeof env !== 'string') {
		throw Error(`Error: invalid setting for VITE_NODE_ENV: ${env}`);
	}
	await User.findByIdAndUpdate(locals.user.id, { refreshTokens: [] });
	const accessToken = cookie.serialize('accessToken', '', {
		httpOnly: true,
		sameSite: env == 'production' ? 'none' : 'lax',
		secure: env == 'production' ? true : false,
		path: '/',
		maxAge: 0
	});

	const refreshToken = cookie.serialize('refreshToken', '', {
		httpOnly: true,
		sameSite: env == 'production' ? 'none' : 'lax',
		secure: env == 'production' ? true : false,
		path: '/',
		maxAge: 0
	});

	return { accessToken, refreshToken };
};

export default logout;
