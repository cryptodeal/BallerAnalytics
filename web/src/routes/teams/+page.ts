import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const url = `/teams`;
	const res = await fetch(url);
	if (res.ok) {
		const { teams } = await res.json();
		return {
			teams
		};
	}
};
