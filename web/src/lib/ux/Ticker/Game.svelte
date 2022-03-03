<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import { invertColor } from '$lib/functions/helpers';
	import { getMainColor } from 'nba-color';
	import type { DailyGame } from '$lib/data/stores/types';
	dayjs.extend(utc);
	dayjs.extend(timezone);

	export let game: DailyGame;
</script>

<div class="inline-block mr-15 bg-dark-400 text-white px-2 bg-opacity-40">
	{#if !game.isOver && dayjs(game.date).isBefore(dayjs().tz('America/New_York'))}
		<div class="inline-block text-red-600 font-semibold animate-pulse text-2xl px-2">Live</div>
	{:else if game.isOver}
		<div class="inline-block text-red-600 font-semibold text-2xl px-2">Final</div>
	{/if}
	<div
		class="inline-block text-2xl px-2 font-semibold"
		style="background-color:{getMainColor(game.visitor.infoCommon.nbaAbbreviation)
			.hex};opacity:100%;color:{invertColor(
			getMainColor(game.visitor.infoCommon.nbaAbbreviation).hex,
			true
		)}"
	>
		{game.visitor.infoCommon.nbaAbbreviation}
	</div>
	{#if game.visitor.score && game.visitor.score !== null}
		<div class="inline-block px-2 bg-red-600 text-2xl font-semibold">
			{game.visitor.score}
		</div>
	{/if}

	<div class="inline-block text-2xl font-semibold">&nbsp;@&nbsp;</div>
	<div
		class="inline-block text-2xl px-2 font-semibold"
		style="background-color:{getMainColor(game.home.infoCommon.nbaAbbreviation)
			.hex};opacity:100%;color:{invertColor(
			getMainColor(game.home.infoCommon.nbaAbbreviation).hex,
			true
		)}"
	>
		{game.home.infoCommon.nbaAbbreviation}
	</div>
	{#if game.home.score && game.home.score !== null}
		<div class="inline-block bg-red-600 px-2 text-2xl font-semibold">
			{game.home.score}
		</div>
	{/if}

	{#if game.home.score == null && game.home.score == null}
		<div class="inline block px-2 text-2xl font-normal">
			{dayjs(game.date).minute() !== 0
				? dayjs(game.date).format('h:mm A') + ' ET'
				: dayjs(game.date).format('h A') + ' ET'}
		</div>
	{/if}
</div>
