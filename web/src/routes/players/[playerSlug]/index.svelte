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
	export let player: Player2Document;
	$: console.log(player);
</script>

<svelte:head>
	<title>{player.name.full} NBA Player Information</title>
	<html lang="en" />
	<meta
		name="Description"
		content="{player.name
			.full} season and historical schedule, basic/advanced statistics, fantasy projections/historical data, and more."
	/>
</svelte:head>
<div class="h-full appContent w-full px-1 pb-4">
	<div class="mt-4 mx-auto glassmorphicBg md:container">
		<div class="flex flex-wrap justify-center text-center opacity-100 items-center">
			<div class="w-25 md:w-30 lg:w-35 xl:w-40 2xl:w-45">
				<Headshot
					avif={player.meta.images.headshot.avif}
					alt="{player.name.full} headshot"
					png={player.meta.images.headshot.png}
					webp={player.meta.images.headshot.webp}
				/>
			</div>
			<h1>{player.name.full}</h1>
		</div>
	</div>
</div>
