import cookie from 'cookie';
import initConnect from '$lib/_db/initConnect';
import decodeToken from '$lib/_api/auth/decodeToken';
//import protect from '$lib/_api/auth/protect';
//import refreshAuth from '$lib/_api/auth/refreshAuth';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ request, resolve }) => {
	await initConnect();

	const cookies = cookie.parse(request.headers.cookie || '');
	//console.log(cookies);

	/* if (cookies && !cookies.accessToken && cookies.refreshToken) {
		request.headers['set-cookie'] = await refreshAuth(cookies);
	}*/

	//if request has accessToken JWT, set claims as request.locals.user
	if (cookies.accessToken) {
		const { payload } = decodeToken(cookies.accessToken);
		request.locals.user = payload;
	}

	/*
    // TODO https://github.com/sveltejs/kit/issues/1046
    if (request.query.has('_method')) {
      request.method = request.query.get('_method').toUpperCase();
    }
  */

	//const isAuth = await protect(request);
	//console.log(isAuth);

	const response = await resolve(request);

	//console.log(response.headers['set-cookie']);

	return response;
};

/** @type {import('@sveltejs/kit').GetSession} */
export async function getSession(request) {
	return {
		user: request.locals.user
	};
}
