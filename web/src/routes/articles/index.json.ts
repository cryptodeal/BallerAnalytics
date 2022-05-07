import { slugFromPath } from '$lib/functions/helpers';

import type { RequestHandler } from '@sveltejs/kit';

export type ArticleIdxData = {
	slug: string;
	title: string;
	description: string;
	author: string;
	date: string;
	published: string;
	prefetch: boolean;
};

export const get: RequestHandler = async ({ url }) => {
	const modules = import.meta.glob('./read/*.{md,svx,svelte.md}');

	const postPromises: Promise<ArticleIdxData>[] = [];
	const limit = Number(url.searchParams.get('limit') ?? Infinity);

	if (Number.isNaN(limit)) {
		return {
			status: 400
		};
	}

	for (const [path, resolver] of Object.entries(modules)) {
		const slug = slugFromPath(path);
		const promise = resolver().then(
			(post) =>
				({
					slug,
					...post.metadata
				} as ArticleIdxData)
		);

		postPromises.push(promise);
	}

	const posts = await Promise.all(postPromises);
	const publishedPosts = posts
		.filter((post) => post.published)
		.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));

	let pages = 0;
	if (publishedPosts.length > limit) {
		publishedPosts.slice(0, limit);
		pages = Math.ceil(publishedPosts.length / limit);
	}

	return {
		body: {
			posts: publishedPosts,
			pages
		}
	};
};
