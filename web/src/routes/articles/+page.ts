import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const url = `/articles`;
	const res = await fetch(url);
	const { posts, pages } = await res.json();
	if (res.ok) {
		return {
			posts,
			pages
		};
	}
	throw error(500, `Could not load ${url}`);
};
