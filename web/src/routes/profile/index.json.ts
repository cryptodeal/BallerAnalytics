import { findUserById } from '$lib/data/_db/controllers/user';
import type { RequestHandler } from '@sveltejs/kit';
import type { Locals } from '$lib/types';
import type { UserObject } from '@balleranalytics/nba-api-ts';

export const get: RequestHandler = async ({ url }) => {
	const userId = url.searchParams.get('userId');
	console.log(userId);
	if (!userId) throw Error('userId is required');

	const userData = await findUserById(userId);
	console.log(userData);

	if (userData) {
		return {
			body: {
				userData
			}
		};
	}

	return {
		status: 500
	};
};

export const post: RequestHandler<Locals, UserObject> = async ({ locals, body }) => {
	console.log(locals);
	console.log(body);
	const user = true;
	if (user) {
		return {
			status: 200
		};
	}

	return {
		status: 503
	};
};
