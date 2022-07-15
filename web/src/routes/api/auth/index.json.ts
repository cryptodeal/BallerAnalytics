import sendAuthLink from '$lib/functions/_api/auth/sendAuthLink';
import uaParser from 'ua-parser-js';
import dayjs from 'dayjs';
import type { RequestHandler } from '@sveltejs/kit';
import type { PostAuthBody } from '$lib/types';

export const POST: RequestHandler = async (event) => {
	const { email } = (await event.request.json()) as PostAuthBody,
		host = event.request.headers.get('host') as string,
		ua = uaParser(event.request.headers.get('user-agent') as string),
		time = dayjs().format('DD MMMM, YYYY HH:mm:ss Z UTC');

	if (
		email.toLowerCase() === 'itshannahwilliams@gmail.com' ||
		email.toLowerCase() === 'james.deal@balleranalytics.ai' ||
		email.toLowerCase() === 'aslakrb@gmail.com'
	) {
		const result = await sendAuthLink(email, ua, time, host);

		return {
			status: result == true ? 200 : 400
		};
	} else {
		return {
			status: 404
		};
	}
};
