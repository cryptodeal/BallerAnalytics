<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import advancedFormat from 'dayjs/plugin/advancedFormat.js';
	import { invertColor } from '$lib/functions/helpers';
	import { getMainColor } from 'nba-color';
	import { browser } from '$app/env';

	import type { DailyGame } from '$lib/data/stores/types';

	export let game: DailyGame;

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.extend(advancedFormat);
	dayjs.tz.setDefault('America/New_York');

	const estDate = dayjs(game.date).tz();
	let localTz;
	$: if (browser) localTz = dayjs.tz.guess();
</script>

<div class="inline-block h-10 mr-50 px-2">
	{#if (!game.isOver && estDate.isBefore(dayjs().tz())) || (!game.isOver && game.home.score && game.visitor.score)}
		<div class="inline-block leading-10 text-red-600 font-semibold animate-pulse text-2xl px-2">
			Live
		</div>
		{#if game.periodValue && game.displayClock}
			<div class="inline-block leading-10 font-semibold text-2xl px-2">
				{game.periodValue < 5 ? `Q${game.periodValue}` : `OT${game.periodValue - 4}`}
				{game.displayClock}
			</div>
		{/if}
	{:else if game.isOver}
		<div class="inline-block leading-10 text-red-600 font-semibold text-2xl px-2">Final</div>
	{/if}
	<div
		class="teamTickerItem inline-block leading-10 text-2xl px-2 font-semibold"
		style:--teamBg={getMainColor(game.visitor.infoCommon.nbaAbbreviation).hex}
		style:--teamColor={invertColor(getMainColor(game.visitor.infoCommon.nbaAbbreviation).hex, true)}
	>
		<div class="glassmorphicBg inline-block h-10 w-10 px-1">
			<img
				class="h-10 w-10 inline-block"
				src="/teams/assets/logo-{game.visitor.infoCommon.slug}.svg"
				alt="{game.visitor.infoCommon.name}'s' logo"
			/>
		</div>

		{game.visitor.infoCommon.nbaAbbreviation}
	</div>
	{#if game.visitor.score && game.visitor.score !== null}
		<div
			class="inline-block leading-10 px-2 text-dark-800 dark:text-light-200 bg-red-600 text-2xl font-semibold"
		>
			{game.visitor.score}
		</div>
	{:else if game.home.score && game.home.score !== null}
		<div
			class="inline-block leading-10 text-dark-800 dark:text-light-200 bg-red-600 px-2 text-2xl font-semibold"
		>
			0
		</div>
	{/if}

	<div class="inline-block leading-10 text-2xl font-semibold">&nbsp;@&nbsp;</div>
	<div
		class="teamTickerItem inline-block leading-10 text-2xl px-2 font-semibold"
		style:--teamBg={getMainColor(game.home.infoCommon.nbaAbbreviation).hex}
		style:--teamColor={invertColor(getMainColor(game.home.infoCommon.nbaAbbreviation).hex, true)}
	>
		<div class="glassmorphicBg inline-block h-10 w-10 px-1">
			<img
				class="h-10 w-10 inline-block"
				src="/teams/assets/logo-{game.home.infoCommon.slug}.svg"
				alt="{game.home.infoCommon.name}'s' logo"
			/>
		</div>
		{game.home.infoCommon.nbaAbbreviation}
	</div>
	{#if game.home.score && game.home.score !== null}
		<div
			class="inline-block text-dark-800 dark:text-light-200 leading-10 bg-red-600 px-2 text-2xl font-semibold"
		>
			{game.home.score}
		</div>
	{:else if game.visitor.score && game.visitor.score !== null}
		<div
			class="inline-block text-dark-800 dark:text-light-200 leading-10 bg-red-600 px-2 text-2xl font-semibold"
		>
			0
		</div>
	{/if}

	{#if game.home.score == null && game.home.score == null}
		<div class="inline-block leading-10 px-2 text-2xl font-normal">
			{estDate.minute() !== 0
				? estDate.tz(localTz).format('h:mm A z')
				: estDate.tz(localTz).format('h A z')}
		</div>
	{/if}
</div>

<style lang="postcss">
	.teamTickerItem {
		background-color: var(--teamBg);
		color: var(--teamColor);
	}
</style>
