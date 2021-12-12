import logout from '$lib/_api/auth/logout';
/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get(request) {
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
}
