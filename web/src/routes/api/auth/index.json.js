import sendAuthLink from '$lib/_api/auth/sendAuthLink';
import uaParser from 'ua-parser-js';
import dayjs from 'dayjs';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post({ headers, body, host }) {
	const ua = uaParser(headers['user-agent']);
	let time = dayjs().format('DD MMMM, YYYY HH:mm:ss Z UTC');

	const result = await sendAuthLink(body.email, ua, time, host);

	if (result == true) {
		return {
			status: 200
		};
	} else {
		return {
			status: 503
		};
	}
}
