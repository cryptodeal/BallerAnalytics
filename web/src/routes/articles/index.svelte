<script lang="ts" context="module">
	export async function load({ fetch }) {
		const url = `/articles.json`;
		const res = await fetch(url);
		const { posts, pages } = await res.json();
		if (res.ok) {
			return {
				props: {
					posts,
					pages
				}
			};
		}
		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import Paginate from '$lib/ux/paginate/traditional.svelte';
	import type { ArticleIdxData } from './index.json';

	export let posts: ArticleIdxData[], pages: number;
</script>

<MetaTags
	title="BallerAnalytics.ai Articles - Writeups for Basketball and Developer Geeks Alike"
	description="List of articles and posts written by the team behind BallerAnalytics.ai."
/>

<section class="w-full mt-10">
	<div class="glassmorphicBg rounded-lg flex flex-col p-2 md:(container flex-col mx-auto)">
		<h1 class="text-center font-light md:(pl-10 py-3 text-left)">Articles</h1>
		<div class="p-3 w-full flex flex-col">
			{#each posts as { slug, title, author, prefetch }}
				{#if prefetch}
					<a class="no-underline" sveltekit:prefetch href="articles/read/{slug}">
						<h2 class="font-extralight font-sans hover:text-blue-700 dark:hover:text-blue-300">
							{title}
						</h2>
					</a>
				{:else}
					<a class="no-underline" href="articles/read/{slug}">
						<h2 class="font-extralight font-sans hover:text-blue-700 dark:hover:text-blue-300">
							{title}
						</h2>
					</a>
				{/if}
				<h6 class="pl-5 font-light text-dark-800 dark:text-light-200">By: {author}</h6>
			{/each}
			<div class="flex mx-auto pt-3">
				<Paginate {pages} />
			</div>
		</div>
	</div>
</section>
