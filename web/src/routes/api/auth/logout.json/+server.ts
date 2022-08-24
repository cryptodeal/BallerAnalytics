import logout from '$lib/functions/_api/auth/logout';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const { locals } = event;
	// Log the user out and clear access/refresh token cookies
	const { accessToken, refreshToken } = await logout(locals);
	event.locals = {};
	const headers = new Headers();
	headers.append('set-cookie', accessToken);
	headers.append('set-cookie', refreshToken);
	headers.append('location', '/');
	return new Response(undefined, {
		status: 302,
		headers
	});
};
