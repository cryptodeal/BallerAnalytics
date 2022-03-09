<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';
	export const load: Load = async ({ fetch, params }) => {
		const url = `/players/${params.playerSlug}.json`;
		const res = await fetch(url);
		if (res.ok) {
			const { playerData: player }: { playerData: Player2Document } = await res.json();
			return {
				props: {
					player
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	export let player: Player2Document;
	console.log(player);
</script>

<MetaTags
	title="{player.name.full}: Player Bio & Stats"
	description="{player.name
		.full}'s season and historical schedule, basic/advanced statistics, fantasy projections/historical data, and more."
/>

<div class="h-full appContent w-full px-1 pb-4">
	<div class="mt-4 sm:container mx-auto">
		<div class="text-black glassmorphicBg flex flex-wrap justify-center items-center">
			<div class="w-25 md:w-30 lg:w-35 xl:w-40 2xl:w-45">
				<Headshot
					avif={player.meta.images.headshot.avif}
					alt="{player.name.full} headshot"
					png={player.meta.images.headshot.png}
					webp={player.meta.images.headshot.webp}
				/>
			</div>
			<h1 class="text-dark-800 dark:text-light-200">{player.name.full}</h1>
		</div>
	</div>
</div>
