import { redirect } from '@sveltejs/kit';
import type { PageLoad } from '@sveltejs/kit';
export const load: PageLoad = async ({ fetch, session }) => {
	if (!session.user) {
		throw redirect(302, '/');
	}
	const url = `/profile.json?userId=${session.user.id}`;
	const res = await fetch(url);
	const { userData } = await res.json();

	//console.log(userData);
	return {
		user: userData
	};
};
