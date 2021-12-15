import sendAuthLink from '$lib/functions/_api/auth/sendAuthLink';
import uaParser from 'ua-parser-js';
import dayjs from 'dayjs';
import type { RequestHandler } from '@sveltejs/kit';
import type { Locals } from '$lib/types';

export const post: RequestHandler<Locals, FormData> = async ({ headers, body, host }) => {
	console.log(body);
	const ua = uaParser(headers['user-agent']);
	const time: string = dayjs().format('DD MMMM, YYYY HH:mm:ss Z UTC');

	const result = await sendAuthLink(body.email, ua, time, host);

	if (result == true) {
		return {
			status: 200
		};
	}

	return {
		status: 503
	};
};
