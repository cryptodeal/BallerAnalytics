import { json } from '@sveltejs/kit';
import { slugFromPath } from '$lib/functions/helpers';

import type { RequestHandler } from './$types';

export type ArticleIdxData = {
	slug: string;
	title: string;
	description: string;
	author: string;
	date: string;
	published: string;
	prefetch: boolean;
};

export const GET: RequestHandler = async ({ url }) => {
	const modules = import.meta.glob('./read/**/*.{md,svx,svelte.md}');

	const postPromises: Promise<ArticleIdxData>[] = [];
	const limit = Number(url.searchParams.get('limit') ?? Infinity);

	if (Number.isNaN(limit)) {
		return new Response(undefined, { status: 400 });
	}

	for (const [path, resolver] of Object.entries(modules)) {
		const slug = slugFromPath(path);
		const promise = resolver().then(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(post: any) =>
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

	return json({
		posts: publishedPosts,
		pages
	});
};
