import sendAuthLink from '$lib/_api/auth/sendAuthLink';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post(request) {
	const { body } = request;
	console.log(body);

	const result = await sendAuthLink(body.email);

	if (result == true) {
		return {
			status: 200,
			body: {
				msg: 'success; check email to login'
			}
		};
	} else {
		return {
			status: 503,
			body: {
				err: result
			}
		};
	}
}
