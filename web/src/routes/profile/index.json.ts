import { findUserById } from '$lib/data/_db/controllers/user';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ query }) => {
	const userId = query.get('userId');
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
