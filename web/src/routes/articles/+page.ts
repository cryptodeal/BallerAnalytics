import { error } from '@sveltejs/kit';
import type { PageLoad } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch }) => {
	const url = `/articles.json`;
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
