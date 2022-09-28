<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import advancedFormat from 'dayjs/plugin/advancedFormat.js';
	import { dailyGames } from '$lib/data/stores/games';
	import type { PopulatedDocument, Game2Document } from '@balleranalytics/nba-api-ts';
	import { browser } from '$app/environment';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.extend(advancedFormat);

	export let game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>;
	let localTz, estDate;
	$: if (browser) localTz = dayjs.tz.guess();
	$: if (game) estDate = dayjs(game.date).utc().tz();
</script>

<div class="mx-auto rounded-lg glassmorphicBg h-34 my-6 sm:w-[30rem]">
	<div class="h-24 w-full inline-flex items-center">
		<div class="flex flex-col justify-center h-full w-1/4">
			<div
				class="h-3/5 w-full rounded-lg p-1 dark:bg-white/10 dark:backdrop-filter dark:backdrop-blur-sm"
			>
				<img
					class="h-3/5 w-full"
					src="/teams/assets/logo-{game.visitor.team.infoCommon.slug}.svg"
					alt="{game.visitor.team.infoCommon.name}'s' logo"
				/>
			</div>
			<div class="h-2/5 inline-flex align-middle items-center justify-center">
				<h6 class="inline-flex align-middle items-center justify-center ">
					{capitalizeFirstLetter(game.visitor.team.infoCommon.slug)}
				</h6>
			</div>
		</div>
		<div class="inline-flex items-center justify-center h-full w-1/2 text-center ">
			<div class="w-1/4 ">
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
				<div>@</div>
				{#if !game.meta.helpers.isOver && dayjs().tz().isBefore(dayjs(game.date).tz())}
					<div>
						{estDate.minute() !== 0
							? estDate.tz(localTz).format('h:mm A z')
							: estDate.tz(localTz).format('h A z')}
					</div>
				{:else if (!game.meta.helpers.isOver && dayjs(game.date)
						.tz()
						.isBefore(dayjs().tz())) || (!game.meta.helpers.isOver && game.home.stats.totals?.points && game.visitor.stats.totals?.points)}
					<div class="leading-10 text-red-600 font-semibold animate-pulse text-xl px-2">Live</div>
					{#if $dailyGames[game._id.toString()] && $dailyGames[game._id.toString()].periodValue && $dailyGames[game._id.toString()].displayClock}
						<div class="font-semibold px-2">
							{$dailyGames[game._id.toString()].periodValue < 5
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
					<div class="leading-10 font-semibold px-2 text-xl">Final</div>
				{/if}
			</div>
			<div class="w-1/4 ">
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
		<div class="flex flex-col justify-center h-full w-1/4">
			<div
				class="h-3/5 p-1 w-full rounded-lg dark:bg-white/10 dark:backdrop-filter dark:backdrop-blur-sm"
			>
				<img
					class="h-3/5 w-full"
					src="/teams/assets/logo-{game.home.team.infoCommon.slug}.svg"
					alt="{game.home.team.infoCommon.name}'s' logo"
				/>
			</div>
			<div class="h-2/5 inline-flex items-center justify-center">
				<h6 class="inline-flex align-middle items-center justify-center ">
					{capitalizeFirstLetter(game.home.team.infoCommon.slug)}
				</h6>
			</div>
		</div>
	</div>
	<div
		class="h-10 border-t border-dark-50 w-full inline-flex align-middle items-center justify-center"
	>
		<a
			class=""
			sveltekit:prefetch
			href="/games/boxscore/{estDate.format('YYYYMMDD')}/{game.visitor.team.seasons.find(
				(s) => s.season === game.meta.helpers.bballRef.year
			).infoCommon.abbreviation}@{game.home.team.seasons.find(
				(s) => s.season === game.meta.helpers.bballRef.year
			).infoCommon.abbreviation}">Boxscore</a
		>
	</div>
</div>
