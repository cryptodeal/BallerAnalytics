<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';
	export const load: Load = async ({ fetch, page }) => {
		const url = `/players/${page.params.playerSlug}.json`;
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
</script>

<div class="appContent">
	<div class="h-full w-full px-1 py-4">
		<div class="w-auto mx-auto glassmorphicBg">
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
</div>
