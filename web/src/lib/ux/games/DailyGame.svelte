<script lang="ts">
	import type { DailyGame } from '$lib/data/stores/types';
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	export let game: DailyGame;
	// export let i: number = ;
	$: console.log(game);
</script>

<div class="w-100 inline-flex bg-red-400">
	<div class="flex flex-col w-auto justify-center">
		<img
			class="antialiased mx-auto"
			height="48px"
			width="48px"
			src="/assets/teams/min-{game.visitor.infoCommon.slug}.svg"
			alt="{game.visitor.infoCommon.slug} logo"
		/>
		<div class="text-sm text-center leading-5">
			{capitalizeFirstLetter(game.visitor.infoCommon.slug)}
		</div>
	</div>
</div>
