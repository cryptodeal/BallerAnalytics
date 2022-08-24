import type { PageLoad } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch }) => {
	const url = `/api/auth/logout.json`;
	const res = await fetch(url);
	if (res.ok) {
		return {};
	}
};
