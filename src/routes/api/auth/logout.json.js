import logout from '$lib/_api/auth/logout';
/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ locals }) {
	console.log(locals);
	/// Log the user out and clear access/refresh token cookies
	const { accessToken, refreshToken } = await logout(locals);

	if (accessToken && refreshToken) {
		return {
			status: 302,
			headers: {
				location: '/',
				'set-cookie': [accessToken, refreshToken]
			}
		};
	}
}
