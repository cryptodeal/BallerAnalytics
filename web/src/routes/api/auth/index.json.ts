import sendAuthLink from '$lib/functions/_api/auth/sendAuthLink';
import uaParser from 'ua-parser-js';
import dayjs from 'dayjs';
import type { RequestHandler } from '@sveltejs/kit';
import type { PostAuthBody } from '$lib/types';

export const post: RequestHandler = async (event) => {
	const { email } = (await event.request.json()) as PostAuthBody,
		host = event.request.headers.get('host'),
		ua = uaParser(event.request.headers.get('user-agent')),
		time = dayjs().format('DD MMMM, YYYY HH:mm:ss Z UTC');

	const result = await sendAuthLink(email, ua, time, host);

	if (result == true) {
		return {
			status: 200
		};
	}

	return {
		status: 503
	};
};
