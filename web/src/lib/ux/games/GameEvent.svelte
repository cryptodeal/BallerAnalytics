<script lang="ts">
	import TeamLogo from '$lib/ux/teams/assets/AnyTeamLogo.svelte';
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import advancedFormat from 'dayjs/plugin/advancedFormat.js';
	import { dailyGames } from '$lib/data/stores/games';
	import type { PopulatedDocument, Game2Document } from '@balleranalytics/nba-api-ts';
	import type { MetaGlobImport } from '$lib/types';
	import { browser } from '$app/env';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.extend(advancedFormat);
	dayjs.tz.setDefault('America/New_York');

	export let game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>;
	export let logoModules: MetaGlobImport;
	let localTz;
	$: if (browser) localTz = dayjs.tz.guess();
	const estDate = dayjs(game.date).tz();
</script>

<div class="mx-auto rounded-lg glassmorphicBg h-25 my-6 sm:w-100">
	<div class="h-full w-full flex inline-flex items-center ">
		<div class="flex flex-wrap justify-center p-1 h-full w-1/4 ">
			<div
				class="h-6/10 w-full mb-1 rounded-lg dark:(bg-white backdrop-filter backdrop-blur-sm bg-opacity-10)"
			>
				<TeamLogo slug={game.visitor.team.infoCommon.slug} {logoModules} />
			</div>
			<h6 class="h-4/10 text-dark-800 dark:text-light-200">
				{capitalizeFirstLetter(game.visitor.team.infoCommon.slug)}
			</h6>
		</div>
		<div
			class="flex inline-flex items-center justify-center h-full w-1/2 text-center text-dark-800 dark:text-light-200"
		>
			<div class="w-1/4 text-dark-800 dark:text-light-200">
				{#if $dailyGames[game._id.toString()] && $dailyGames[game._id.toString()].visitor.score}
					{$dailyGames[game._id.toString()].visitor.score}
				{:else if game.visitor.score && game.visitor.score !== null}
					{game.visitor.score}
				{:else if game.visitor.stats.totals?.points && game.visitor.stats.totals.points !== null}
					{game.visitor.stats.totals.points}
				{:else if game.home.score || (game.home.stats.totals?.points && game.home.stats.totals.points !== null)}
					0
				{/if}
			</div>

			<div class="flex flex-col w-1/2">
				<div class="text-dark-800 dark:text-light-200">@</div>
				{#if !game.meta.helpers.isOver && dayjs().tz().isBefore(dayjs(game.date).tz())}
					<div class="text-dark-800 text-lg dark:text-light-200">
						{estDate.minute() !== 0
							? estDate.tz(localTz).format('h:mm A z')
							: estDate.tz(localTz).format('h A z')}
					</div>
				{:else if (!game.meta.helpers.isOver && dayjs(game.date)
						.tz()
						.isBefore(dayjs().tz())) || (!game.meta.helpers.isOver && game.home.stats.totals?.points && game.visitor.stats.totals?.points)}
					<div class="leading-10 text-red-600 font-semibold animate-pulse text-xl px-2">Live</div>
					{#if $dailyGames[game._id.toString()].periodValue && $dailyGames[game._id.toString()].displayClock}
						<div class="font-semibold px-2">
							{game.meta.status.period < 5
								? `Q${$dailyGames[game._id.toString()].periodValue}`
								: `OT${$dailyGames[game._id.toString()].periodValue - 4}`}
							{$dailyGames[game._id.toString()].displayClock}
						</div>
					{:else if game.meta.status?.period && game.meta.status?.displayClock}
						<div class="font-semibold px-2">
							{game.meta.status.period < 5
								? `Q${game.meta.status.period}`
								: `OT${game.meta.status.period - 4}`}
							{game.meta.status.displayClock}
						</div>
					{/if}
				{:else}
					<div class="leading-10 font-semibold px-2 text-dark-800 text-xl dark:text-light-200">
						Final
					</div>
				{/if}
			</div>
			<div class="w-1/4 text-dark-800 dark:text-light-200">
				{#if $dailyGames[game._id.toString()] && $dailyGames[game._id.toString()].home.score}
					{$dailyGames[game._id.toString()].home.score}
				{:else if game.visitor.score && game.visitor.score !== null}
					{game.home.score}
				{:else if game.home.stats.totals?.points && game.home.stats.totals.points !== null}
					{game.home.stats.totals.points}
				{:else if (game.visitor.score && game.visitor.score !== null) || (game.visitor.stats.totals?.points && game.visitor.stats.totals.points !== null)}
					0
				{/if}
			</div>
		</div>
		<div class="flex flex-wrap justify-center p-1 h-full w-1/4">
			<div
				class="h-6/10 w-full mb-1 rounded-lg dark:(bg-white backdrop-filter backdrop-blur-sm bg-opacity-10)"
			>
				<TeamLogo slug={game.home.team.infoCommon.slug} {logoModules} />
			</div>
			<h6 class="h-4/10 text-dark-800 dark:text-light-200">
				{capitalizeFirstLetter(game.home.team.infoCommon.slug)}
			</h6>
		</div>
	</div>
</div>
