import cookie from 'cookie';
import { serverlessConnect } from '@balleranalytics/nba-api-ts';
import config from '$lib/_config';
import decodeToken from '$lib/functions/_api/auth/decodeToken';
import refreshAuth from '$lib/functions/_api/auth/refreshAuth';
// import { minify } from 'html-minifier';
// import { prerendering } from '$app/env';
import type { Handle } from '@sveltejs/kit';
import { expireTokens } from '$lib/functions/_api/auth/logout';

/*
  const minification_options = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    decodeEntities: true,
    html5: true,
    ignoreCustomComments: [/^#/],
    minifyCSS: true,
    minifyJS: false,
    removeAttributeQuotes: true,
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true
  };
*/

export const handle: Handle = async ({ event, resolve }) => {
	await serverlessConnect(config.MONGO_URI);
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	let refreshedAccessToken: undefined | string = undefined;

	if (!cookies['accessToken'] && cookies['refreshToken']) {
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

	if (!cookies['accessToken'] && refreshedAccessToken) {
		/**
		 * if user has refreshToken, but accessToken is expired,
		 * we can set a new accessToken using the existing refreshToken
		 */
		response.headers.set('set-cookie', refreshedAccessToken);
	} else if (!cookies['accessToken'] && cookies['refreshToken']) {
		/**
		 * if !refreshedAccessToken, the user has a refreshToken set,
		 * but it's not valid anymore (expired in backend); so we expire
		 * the refreshToken entirely
		 */
		const { refreshToken } = expireTokens();
		response.headers.set('set-cookie', refreshToken);
	}

	/* TODO: pending see: https://github.com/sveltejs/kit/issues/4247
    if (prerendering && response.headers.get('content-type') === 'text/html') {
      return new Response(minify(await response.text(), minification_options), {
        status: response.status,
        headers: response.headers
      });
    }
  */

	return response;
};
