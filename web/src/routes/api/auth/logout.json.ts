import logout from '$lib/functions/_api/auth/logout';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async (request) => {
	const { locals } = request;
	/// Log the user out and clear access/refresh token cookies
	//const { accessToken, refreshToken } = await logout(locals);
	const { accessToken } = await logout(locals);
	request.locals = {};

	if (accessToken) {
		return {
			status: 302,
			headers: {
				//'set-cookie': [accessToken, refreshToken]
				'set-cookie': accessToken,
				location: '/'
			}
		};
	}
};
