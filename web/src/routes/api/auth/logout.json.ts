import logout from '$lib/functions/_api/auth/logout';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const { locals } = event;
	// Log the user out and clear access/refresh token cookies
	const { accessToken, refreshToken } = await logout(locals);
	event.locals = {};

	if (accessToken) {
		return {
			status: 302,
			headers: {
				'set-cookie': [accessToken, refreshToken],
				location: '/'
			}
		};
	}
	return {
		status: 205
	};
};
