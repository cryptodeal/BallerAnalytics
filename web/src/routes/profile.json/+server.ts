import { json } from '@sveltejs/kit';
import { findUserById, addNewUserFormData, updateUserData } from '$lib/data/_db/controllers/user';
import protect from '$lib/functions/_api/auth/protect';
import { validateUserForm } from '$lib/functions/helpers';
import type { RequestHandler } from './$types';
import type { NewUserFormData, JWTPayload } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const userId = url.searchParams.get('userId');
	if (!userId) throw Error('userId is required');

	const userData = await findUserById(userId);

	if (userData) {
		return json({
			userData
		});
	}

	return new Response(undefined, { status: 500 });
};

export type ProfilePostType = 'Add' | 'Update';

export const POST: RequestHandler = async (event) => {
	const data = (await event.request.json()) as NewUserFormData;
	if (data.consentTandC) {
		const { valid, errors } = validateUserForm(data);
		if (!valid) {
			console.log(errors);
			return json(
				{
					error: `Error: ${errors.join(', ')}`
				},
				{
					status: 422
				}
			);
		}
		const userAuth = (await protect(event.request.headers)) as JWTPayload;
		if (!userAuth) {
			throw new Error(`Error: unable to authenticate request`);
		}

		const user = await addNewUserFormData(userAuth.id, data);
		if (user) {
			return new Response(undefined);
		}

		return new Response(undefined, { status: 503 });
	} else {
		/* TODO: update user data */
		const userAuth = (await protect(event.request.headers)) as JWTPayload;
		if (!userAuth) {
			throw new Error(`Error: unable to authenticate request`);
		}

		const user = await updateUserData(userAuth.id, data);
		if (user) {
			return new Response(undefined);
		}

		return new Response(undefined, { status: 503 });
	}
};
