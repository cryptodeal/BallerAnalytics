import { redirect } from '@sveltejs/kit';
import { session } from '$lib/data/stores';
import type { PageLoad } from './$types';

/* TODO: REMOVE SESSION */
export const load: PageLoad = async ({ fetch }) => {
	if (!session.subscribe((v) => v.user)) {
		throw redirect(302, '/');
	}
	const url = `/profile.json?userId=${session.subscribe(({ user }) => user.id)}`;
	const res = await fetch(url);
	const { userData } = await res.json();

	//console.log(userData);
	return {
		user: userData
	};
};
