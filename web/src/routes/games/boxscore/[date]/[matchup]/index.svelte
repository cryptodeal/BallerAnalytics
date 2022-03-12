<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { BoxScoreLoadParams, BoxScoreBody } from '$lib/types';
	export const logoModules = import.meta.globEager(
		'../../../../../lib/ux/teams/assets/logo-*.svelte'
	);

	export const load: Load<BoxScoreLoadParams, BoxScoreBody> = async ({ fetch, params }) => {
		const { date, matchup } = params;
		let apiUrl = `/games/boxscore/${date}/${matchup}.json`;
		const res = await fetch(apiUrl);

		if (res.ok) {
			const { boxscore } = await res.json();
			return {
				props: {
					boxscore
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${apiUrl}`)
		};
	};
</script>

<script lang="ts">
	import TeamLogo from '$lib/ux/teams/assets/AnyTeamLogo.svelte';
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	import { browser } from '$app/env';
	import { dailyGames } from '$lib/data/stores/games';
	import BoxScoreTable from '$lib/ux/tables/games/Boxscore.svelte';
	import TabPanel from '$lib/ux/tabs/TabPanel.svelte';
	import TabList from '$lib/ux/tabs/TabList.svelte';
	import Tabs from '$lib/ux/tabs/Tabs.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import advancedFormat from 'dayjs/plugin/advancedFormat.js';
	import type { BoxScoreData } from '$lib/types';

	export let boxscore: BoxScoreData;

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.extend(advancedFormat);
	dayjs.tz.setDefault('America/New_York');
	// $: console.log(boxscore);
	let localTz;
	$: if (browser) localTz = dayjs.tz.guess();
	const estDate = dayjs(boxscore.date).tz();
</script>

<div class="appContent w-screen flex flex-col gap-6">
	<div class="mx-2 rounded-lg glassmorphicBg lg:(container mx-auto)">
		<div class="h-25 w-full flex inline-flex items-center ">
			<div class="flex flex-wrap justify-center p-1 h-full w-1/4 ">
				<div
					class="h-6/10 w-full mb-1 rounded-lg dark:(bg-white backdrop-filter backdrop-blur-sm bg-opacity-10)"
				>
					<TeamLogo slug={boxscore.visitor.team.infoCommon.slug} {logoModules} />
				</div>
				<h6 class="h-4/10 text-dark-800 dark:text-light-200">
					{capitalizeFirstLetter(boxscore.visitor.team.infoCommon.slug)}
				</h6>
			</div>
			<div
				class="flex inline-flex items-center justify-center h-full w-1/2 text-center text-dark-800 dark:text-light-200"
			>
				<div class="w-1/4 text-dark-800 dark:text-light-200">
					{#if $dailyGames[boxscore._id.toString()] && $dailyGames[boxscore._id.toString()].visitor.score}
						{$dailyGames[boxscore._id.toString()].visitor.score}
					{:else if boxscore.visitor.score && boxscore.visitor.score !== null}
						{boxscore.visitor.score}
					{:else if boxscore.visitor.stats.totals?.points && boxscore.visitor.stats.totals.points !== null}
						{boxscore.visitor.stats.totals.points}
					{:else if boxscore.home.score || (boxscore.home.stats.totals?.points && boxscore.home.stats.totals.points !== null)}
						0
					{/if}
				</div>

				<div class="flex flex-col w-1/2">
					<div class="text-dark-800 dark:text-light-200">@</div>
					{#if !boxscore.meta.helpers.isOver && dayjs().tz().isBefore(dayjs(boxscore.date).tz())}
						<div class="text-dark-800 text-lg dark:text-light-200">
							{estDate.minute() !== 0
								? estDate.tz(localTz).format('h:mm A z')
								: estDate.tz(localTz).format('h A z')}
						</div>
					{:else if (!boxscore.meta.helpers.isOver && dayjs(boxscore.date)
							.tz()
							.isBefore(dayjs().tz())) || (!boxscore.meta.helpers.isOver && boxscore.home.stats.totals?.points && boxscore.visitor.stats.totals?.points)}
						<div class="leading-10 text-red-600 font-semibold animate-pulse text-xl px-2">Live</div>
						{#if $dailyGames[boxscore._id.toString()] && $dailyGames[boxscore._id.toString()].periodValue && $dailyGames[boxscore._id.toString()].displayClock}
							<div class="font-semibold px-2">
								{$dailyGames[boxscore._id.toString()].periodValue < 5
									? `Q${$dailyGames[boxscore._id.toString()].periodValue}`
									: `OT${$dailyGames[boxscore._id.toString()].periodValue - 4}`}
								{$dailyGames[boxscore._id.toString()].displayClock}
							</div>
						{:else if boxscore.meta.status?.period && boxscore.meta.status?.displayClock}
							<div class="font-semibold px-2">
								{boxscore.meta.status.period < 5
									? `Q${boxscore.meta.status.period}`
									: `OT${boxscore.meta.status.period - 4}`}
								{boxscore.meta.status.displayClock}
							</div>
						{/if}
					{:else}
						<div class="leading-10 font-semibold px-2 text-dark-800 text-xl dark:text-light-200">
							Final
						</div>
					{/if}
				</div>
				<div class="w-1/4 text-dark-800 dark:text-light-200">
					{#if $dailyGames[boxscore._id.toString()] && $dailyGames[boxscore._id.toString()].home.score}
						{$dailyGames[boxscore._id.toString()].home.score}
					{:else if boxscore.visitor.score && boxscore.visitor.score !== null}
						{boxscore.home.score}
					{:else if boxscore.home.stats.totals?.points && boxscore.home.stats.totals.points !== null}
						{boxscore.home.stats.totals.points}
					{:else if (boxscore.visitor.score && boxscore.visitor.score !== null) || (boxscore.visitor.stats.totals?.points && boxscore.visitor.stats.totals.points !== null)}
						0
					{/if}
				</div>
			</div>
			<div class="flex flex-wrap justify-center p-1 h-full w-1/4">
				<div
					class="h-6/10 w-full mb-1 rounded-lg dark:(bg-white backdrop-filter backdrop-blur-sm bg-opacity-10)"
				>
					<TeamLogo slug={boxscore.home.team.infoCommon.slug} {logoModules} />
				</div>
				<h6 class="h-4/10 text-dark-800 dark:text-light-200">
					{capitalizeFirstLetter(boxscore.home.team.infoCommon.slug)}
				</h6>
			</div>
		</div>
	</div>
	<div class="w-full mx-2 lg:(container mx-auto)">
		<Tabs>
			<div class="w-full glassmorphicCard mx-1 px-2 py-1 md:w-auto">
				<TabList links={[{ title: 'Basic Stats' }, { title: 'Advanced Stats' }]} />
			</div>

			<!-- Basic Stats Data Tab -->
			<TabPanel>
				<div class="glassmorphicCard px-4 py-2 my-5">
					<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">Home Team Basic Stats:</h2>
					<BoxScoreTable {boxscore} isHome={true} />
				</div>

				<div class="glassmorphicCard px-4 py-2 my-5">
					<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">Visitor Team Basic Stats:</h2>
					<BoxScoreTable {boxscore} isHome={false} />
				</div>
			</TabPanel>

			<!-- Advanced Stats Data Tab -->
			<TabPanel>
				<div class="glassmorphicCard px-4 py-2 my-5">
					<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">Home Team Advanced Stats:</h2>
					<BoxScoreTable {boxscore} isHome={true} />
				</div>

				<div class="glassmorphicCard px-4 py-2 my-5">
					<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">
						Visitor Team Advanced Stats:
						<BoxScoreTable {boxscore} isHome={false} />
					</h2>
				</div>
			</TabPanel>
		</Tabs>
	</div>
</div>
