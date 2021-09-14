import sendAuthLink from '$lib/_api/auth/sendAuthLink';
import uaParser from 'ua-parser-js';
import dayjs from 'dayjs';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post({ headers, body }) {
	//const { body } = request;
	const ua = uaParser(headers['user-agent']);
	let time = dayjs().format('DD MMMM, YYYY HH:mm:ss Z UTC');

	const result = await sendAuthLink(body.email, ua, time);

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
