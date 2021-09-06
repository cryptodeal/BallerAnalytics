//import cookie from 'cookie';
//import { v4 as uuid } from '@lukeed/uuid';
//import initConnect from '$lib/_db/initConnect';
import protect from '$lib/_api/auth/protect';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ request, resolve }) => {
	//await initConnect();
	/*
  const cookies = cookie.parse(request.headers.cookie || '');
	request.locals.userid = cookies.userid || uuid();

	// TODO https://github.com/sveltejs/kit/issues/1046
	if (request.query.has('_method')) {
		request.method = request.query.get('_method').toUpperCase();
	}
  */
	const isAuth = await protect(request);
	console.log(isAuth);

	const response = await resolve(request);

	/* 
  if (!cookies.userid) {
		// if this is the first time the user has visited this app,
		// set a cookie so that we recognise them when they return
		response.headers['set-cookie'] = `userid=${request.locals.userid}; Path=/; HttpOnly`;
	}
  */

	return response;
};
