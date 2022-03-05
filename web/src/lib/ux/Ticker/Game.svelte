<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import { invertColor } from '$lib/functions/helpers';
	import { getMainColor } from 'nba-color';
	import TeamLogo from '../teams/assets/AnyTeamLogo.svelte';
	const logoModules = import.meta.globEager('../teams/assets/logo-*.svelte');

	import type { DailyGame } from '$lib/data/stores/types';

	export let game: DailyGame;
	const isTicker = true;
	dayjs.extend(utc);
	dayjs.extend(timezone);
</script>

<div class="inline-block mr-50 bg-dark-400 text-white px-2 bg-opacity-40">
	{#if !game.isOver && (dayjs(game.date)
			.utc()
			.tz('America/New_York')
			.isBefore(dayjs()
					.utc()
					.tz('America/New_York')) || (game.home.score && game.home.score !== null && game.visitor.score && game.visitor.score !== null))}
		<div class="inline-block text-red-600 font-semibold animate-pulse text-2xl px-2">Live</div>
		{#if game.periodValue && game.displayClock}
			<div class="inline-block font-semibold animate-pulse text-2xl px-2">
				Q{game.periodValue}
				{game.displayClock}
			</div>
		{/if}
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
		<div
			class="inline-block px-1 bg-white backdrop-filter backdrop-blur-xl bg-opacity-30 dark:(bg-dark-900 backdrop-filter backdrop-blur-2xl bg-opacity-30)"
		>
			<TeamLogo {isTicker} size={32} {logoModules} slug={game.visitor.infoCommon.slug} />
		</div>

		{game.visitor.infoCommon.nbaAbbreviation}
	</div>
	{#if game.visitor.score && game.visitor.score !== null}
		<div class="inline-block px-2 bg-red-600 text-2xl font-semibold">
			{game.visitor.score}
		</div>
	{:else if game.home.score && game.home.score !== null}
		<div class="inline-block bg-red-600 px-2 text-2xl font-semibold">0</div>
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
		<div
			class="inline-block px-1 bg-white backdrop-filter backdrop-blur-xl bg-opacity-30 dark:(bg-dark-900 backdrop-filter backdrop-blur-2xl bg-opacity-30)"
		>
			<TeamLogo {isTicker} size={32} {logoModules} slug={game.home.infoCommon.slug} />
		</div>
		{game.home.infoCommon.nbaAbbreviation}
	</div>
	{#if game.home.score && game.home.score !== null}
		<div class="inline-block bg-red-600 px-2 text-2xl font-semibold">
			{game.home.score}
		</div>
	{:else if game.visitor.score && game.visitor.score !== null}
		<div class="inline-block bg-red-600 px-2 text-2xl font-semibold">0</div>
	{/if}

	{#if game.home.score == null && game.home.score == null}
		<div class="inline-block px-2 text-2xl font-normal">
			{dayjs(game.date).minute() !== 0
				? dayjs(game.date).format('h:mm A') + ' ET'
				: dayjs(game.date).format('h A') + ' ET'}
		</div>
	{/if}
</div>
