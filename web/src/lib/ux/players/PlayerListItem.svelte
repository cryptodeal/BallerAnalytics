<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';
	export let player: Player2Document;
</script>

{#if player.meta.images.headshot.png.length > 2}
	<Headshot
		src="https://dttbvdi5lj1g6.cloudfront.net/{player.meta.images.headshot.png[2]}"
		alt="{player.name.full} headshot"
	/>
{:else}
	<img class="object-scale-down h-full" src="headshotFallback.png" alt="missing player headshot" />
{/if}

<h5 class="m-4 text-dark-600 dark:text-light-600">{player.name.full}</h5>
