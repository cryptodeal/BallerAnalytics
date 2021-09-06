import createToken from '$lib/_api/auth/createToken';
/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post(request) {
	const { body } = request;
	console.log(body);
	const { accessToken, refreshToken } = await createToken(body.email);
	//console.log(accessToken)
	//console.log(refreshToken)

	if (body) {
		return {
			headers: {
				'set-cookie': [accessToken, refreshToken]
			}
		};
	}
}
