import cookie from 'cookie';
import { serverlessConnect } from '@balleranalytics/nba-api-ts';
import type { Handle, GetSession } from '@sveltejs/kit';
import config from '$lib/_config';
import decodeToken from '$lib/functions/_api/auth/decodeToken';
import refreshAuth from '$lib/functions/_api/auth/refreshAuth';

export const handle: Handle = async ({ event, resolve }) => {
	await serverlessConnect(config.MONGO_URI);
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	let refreshedAccessToken: string;

	if (!cookies.accessToken && cookies.refreshToken) {
		refreshedAccessToken = await refreshAuth(cookies);
	}

	//if request has accessToken JWT, set claims as request.locals.user
	if (cookies.accessToken || refreshedAccessToken) {
		const decoded = decodeToken(cookies.accessToken);
		if (decoded) {
			const { payload } = decoded;
			event.locals.user = payload as {
				id: string;
				email: string;
				scope: string;
				username?: string;
			};
		}
	}

	const response = await resolve(event);
	if (refreshedAccessToken) response.headers.set('set-cookie', refreshedAccessToken);

	return response;
};

export const getSession: GetSession = async (event) => {
	return event.locals.user ? { user: event.locals.user } : {};
};
