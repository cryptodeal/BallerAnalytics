import { findUserById, addNewUserFormData } from '$lib/data/_db/controllers/user';
import protect from '$lib/functions/_api/auth/protect';
import { validateNewUserForm } from '$lib/functions/helpers';
import type { RequestHandler } from '@sveltejs/kit';
import type { Locals, NewUserFormData, JWTPayload } from '$lib/types';

export const get: RequestHandler = async ({ query }) => {
	const userId = query.get('userId');
	if (!userId) throw Error('userId is required');

	const userData = await findUserById(userId);

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

export const post: RequestHandler<Locals, NewUserFormData> = async ({ headers, body }) => {
	const { valid, errors } = validateNewUserForm(body);
	if (!valid) {
		return {
			status: 422,
			body: {
				error: `Error: ${errors.join(', ')}`
			}
		};
	}

	const userAuth = (await protect(headers)) as JWTPayload;
	if (!userAuth) {
		throw new Error(`Error: unable to authenticate request`);
	}

	const user = await addNewUserFormData(userAuth.id, body);
	if (user) {
		return {
			status: 200
		};
	}

	return {
		status: 503
	};
};
