<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import Paginate from '$lib/ux/paginate/traditional.svelte';
  import type { PageData } from './$types';
  export let data: PageData;
  let { posts, pages } = data;
  $: ({ posts, pages } = data); // so it stays in sync when `data` changes

</script>

<MetaTags
	title="BallerAnalytics.ai Articles - Writeups for Basketball and Developer Geeks Alike"
	description="List of articles and posts written by the team behind BallerAnalytics.ai."
/>

<section class="w-full">
	<div class="glassmorphicBg rounded-lg flex flex-col p-2 sm:p-10 md:container md:mx-auto">
		<h1 class="text-center font-light md:py-3 md:text-left">Articles</h1>
		<div class="w-full flex flex-col">
			{#each posts as { slug, title, author, prefetch }}
				<div class="flex flex-col gap-1">
					{#if prefetch}
						<a class="no-underline  md:pl-6" data-sveltekit-prefetch href="articles/read/{slug}">
							<h2 class="font-extralight font-sans">
								{title}
							</h2>
						</a>
					{:else}
						<a class="no-underline md:pl-6" href="articles/read/{slug}">
							<h2 class="font-extralight font-sans">
								{title}
							</h2>
						</a>
					{/if}
					<h6 class="pl-10 font-light">By: {author}</h6>
				</div>
			{/each}
			<div class="flex mx-auto pt-3">
				<Paginate {pages} />
			</div>
		</div>
	</div>
</section>
