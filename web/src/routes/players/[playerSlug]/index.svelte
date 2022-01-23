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
	<div class="h-auto w-full mx-1 mt-4 glassmorphicBg sm:(container mx-auto)">
		<div class="mx-auto w-auto flex inline-flex justify-center items-center">
			<div class="w-30 mr-10">
				<Headshot
					avif={player.meta.images.headshot.avif}
					alt="{player.name.full} headshot"
					png={player.meta.images.headshot.png}
					webp={player.meta.images.headshot.webp}
				/>
			</div>
			<h1 class="w-full">{player.name.full}</h1>
		</div>
	</div>
</div>
