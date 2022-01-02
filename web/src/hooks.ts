import cookie from 'cookie';
import { serverlessConnect } from '@balleranalytics/nba-api-ts';
import type { Handle, GetSession } from '@sveltejs/kit';
import config from '$lib/_config';
import decodeToken from '$lib/functions/_api/auth/decodeToken';
import refreshAuth from '$lib/functions/_api/auth/refreshAuth';

export const handle: Handle = async ({ request, resolve }) => {
	await serverlessConnect(config.MONGO_URI);
	const cookies = cookie.parse(request.headers.cookie || '');
	let refreshedAccessToken: string;

	if (!cookies.accessToken && cookies.refreshToken) {
		refreshedAccessToken = await refreshAuth(cookies);
	}

	//if request has accessToken JWT, set claims as request.locals.user
	if (cookies.accessToken || refreshedAccessToken) {
		const decoded = decodeToken(cookies.accessToken);
		if (decoded) {
			const { payload } = decoded;
			request.locals.user = payload;
		}
	}

	/*
    // TODO https://github.com/sveltejs/kit/issues/1046
    if (request.query.has('_method')) {
      request.method = request.query.get('_method').toUpperCase();
    }
  */

	const response = await resolve(request);
	if (refreshedAccessToken) response.headers['set-cookie'] = refreshedAccessToken;

	return response;
};

export const getSession: GetSession = async (request) => {
	return {
		user: request.locals.user
	};
};
