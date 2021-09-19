import logout from '$lib/_api/auth/logout';
/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get(request) {
	const { locals } = request;
	/// Log the user out and clear access/refresh token cookies
	const { accessToken, refreshToken } = await logout(locals);
	request.locals = {};

	if (accessToken && refreshToken) {
		return {
			headers: {
				'set-cookie': [accessToken, refreshToken]
			}
		};
	}
}
