import cookie from 'cookie';
import { User } from '$lib/_db/models';

const logout = async (locals) => {
	console.log(locals);
	await User.findByIdAndUpdate(locals.user.id, { refreshTokens: [] });
	const accessToken = cookie.serialize('accessToken', '', {
		httpOnly: true,
		sameSite: import.meta.env.VITE_NODE_ENV == 'production' ? 'none' : 'Lax',
		secure: import.meta.env.VITE_NODE_ENV == 'production' ? true : false,
		path: '/',
		maxAge: 0
	});

	const refreshToken = cookie.serialize('refreshToken', '', {
		httpOnly: true,
		sameSite: import.meta.env.VITE_NODE_ENV == 'production' ? 'none' : 'Lax',
		secure: import.meta.env.VITE_NODE_ENV == 'production' ? true : false,
		path: '/',
		maxAge: 0
	});

	return { accessToken, refreshToken };
};

export default logout;
