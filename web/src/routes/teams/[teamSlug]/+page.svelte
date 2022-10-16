<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ScheduleTable from '$lib/ux/tables/teams/Schedule.svelte';
	import PlayerRoster from '$lib/ux/tables/teams/PlayerRoster.svelte';
	import PlayerStats from '$lib/ux/tables/teams/Stats.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	/*
    import type {
      Team2Document,
      PopulatedDocument,
      Player2StatsObject
    } from '@balleranalytics/nba-api-ts';
  */
	import type { TeamPageInitData } from '$lib/data/_db/controllers/team';

	import type { SeasonList, TeamColor } from '$lib/types';
	import TabPanel from '$lib/ux/tabs/TabPanel.svelte';
	import TabList from '$lib/ux/tabs/TabList.svelte';
	import Tabs from '$lib/ux/tabs/Tabs.svelte';
	import Color from 'color';
	import { tweened } from 'svelte/motion';
	import { interpolateLab as interpolate } from 'd3-interpolate';
	import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/environment';
	import { genPalette, getBackgroundColors } from '$lib/ux/svg/core/colors';
	// import type { TeamPageGames } from '$lib/data/_db/controllers/team';
	import type { PageData } from './$types';
	export let data: PageData;
	let { team, games, players, seasonIdx, seasonYear, seasons } = data;
	$: ({ team, games, players, seasonIdx, seasonYear, seasons } = data);
	let year = seasonYear;

	let bgInner = tweened(darkMode ? '#000' : '#fff', { duration: 200, interpolate }),
		bgOuter = tweened(darkMode ? '#000' : '#fff', { duration: 200, interpolate });
	const { hex: primaryColor, rgb: color1 } = getMainColor(
		team.infoCommon.nbaAbbreviation as string
	) as unknown as TeamColor;
	const { hex: secondaryColor, rgb: color2 } = getSecondaryColor(
		team.infoCommon.nbaAbbreviation as string
	) as unknown as TeamColor;
	const colorPalette = genPalette(Color(primaryColor), Color(secondaryColor), 5);
	if (browser) {
		const background = getBackgroundColors(colorPalette);
		$bgInner = background.bgInner;
		$bgOuter = background.bgOuter;
	}

	async function loadRosterData() {
		let tempIdx = (team.seasons as SeasonList[]).findIndex((s) => s.season === year);
		const res = await fetch(`/teams/${team.infoCommon.slug}.json?i=${tempIdx}&year=${year}`);
		const {
			team: teamData,
			players: playerData,
			games: gameData
		}: TeamPageInitData = await res.json();
		team = teamData;
		players = playerData;
		games = gameData;
		seasonIdx = tempIdx;
	}
</script>

<MetaTags
	title="{year} {team.infoCommon.name} Season Basic Info"
	description="Team Schedule, Roster, and Statistics for the {team.infoCommon
		.name}'s {year} season."
/>
<div
	class="glassmorphicCard mx-auto flex flex-wrap gap-6 py-6 justify-center mb-6 items-center px-2 md:container md:mx-auto"
>
	<div class="h-44 rounded-lg dark:bg-white/10 dark:backdrop-filter dark:backdrop-blur-sm">
		<img
			class="h-44 w-44"
			src="/assets/teams/logo-{team.infoCommon.slug}.svg"
			alt="{team.infoCommon.name}'s' logo"
		/>
	</div>
	<h1>
		{team.infoCommon.name}
	</h1>
</div>
<div class="p-2 md:container md:mx-auto">
	<div class="glassmorphicCard inline-flex items-center px-4 py-2 mb-6">
		<label class="text-lg mr-4" for="season-select">Season:</label>

		<select
			class="select select-bordered select-primary"
			type="select"
			id="season-select"
			bind:value={year}
			on:change={loadRosterData}
		>
			{#each seasons as { season }}
				<option value={season}>{season}</option>
			{/each}
		</select>
	</div>
	<Tabs>
		<div class="w-full glassmorphicCard mx-1 px-2 py-1">
			<TabList
				primaryColor={color1}
				secondaryColor={color2}
				links={[{ title: 'Schedule' }, { title: 'Roster' }, { title: 'Stats' }]}
			/>
		</div>

		<!-- Schedule Data Tab -->
		<TabPanel>
			{#if games.regularSeason.length}
				<div class="glassmorphicCard px-4 py-2 my-5">
					<h2 class="tabPanelTitle">
						{team.seasons[seasonIdx].season} Regular Season:
					</h2>
				</div>
				<ScheduleTable schedule={games.regularSeason} teamId={team._id} />
			{:else}
				<h2 class="tabPanelTitle ">
					No games played in {team.seasons[seasonIdx].season}
				</h2>
			{/if}
			{#if games.postseason.length}
				<div class="glassmorphicCard px-4 py-2 my-5">
					<h2 class="tabPanelTitle ">
						{team.seasons[seasonIdx].season} Postseason:
					</h2>
				</div>
				<ScheduleTable schedule={games.postseason} teamId={team._id} />
			{/if}
		</TabPanel>

		<!-- Roster Data Tab -->
		<TabPanel>
			<div class="glassmorphicCard px-4 py-2 my-5">
				<h2 class="tabPanelTitle ">
					{team.seasons[seasonIdx].season} Roster:
				</h2>
			</div>
			<PlayerRoster roster={players} season={year} />
		</TabPanel>

		<!-- Stats Data Tab -->
		<TabPanel>
			<div class="glassmorphicCard px-4 py-2 my-5">
				<h2 class="tabPanelTitle ">
					{team.seasons[seasonIdx].season} Team Stats:
				</h2>
			</div>
			<PlayerStats roster={players} season={year} />
		</TabPanel>
	</Tabs>
</div>

<style lang="postcss">
	.tabPanelTitle {
		@apply text-center m-4;
	}
</style>
