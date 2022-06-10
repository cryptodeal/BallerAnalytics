<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';
	export let player: Player2Document;
</script>

<div class="inline-flex h-full py-1">
	<div class="w-28">
		<Headshot
			avif={player.meta.images.headshot.avif}
			alt="{player.name.full} headshot"
			png={player.meta.images.headshot.png}
			webp={player.meta.images.headshot.webp}
			ratio="60px"
		/>
	</div>
	<h5 class="p-4 text-dark-600 dark:text-light-600">{player.name.full}</h5>
</div>
