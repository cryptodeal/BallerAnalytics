<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { SeasonList } from '$lib/types';
	export const logoModules = import.meta.globEager('../../../lib/ux/teams/assets/logo-*.svelte');

	export const load: Load = async ({ fetch, params, url }) => {
		if (url.searchParams.get('seasonIdx')) {
			const apiUrl = `/teams/${params.teamSlug}.json?seasonIdx=${url.searchParams.get(
				'seasonIdx'
			)}`;
			const res = await fetch(apiUrl);
			if (res.ok) {
				const { teamData } = await res.json();
				const seasonIdx = url.searchParams.get('seasonIdx');
				const seasons: SeasonList[] = [];
				teamData.seasons.map((s) => {
					const { season } = s;
					seasons.push({ season });
				});
				seasons.sort((a, b) => a.season - b.season);
				return {
					props: {
						teamData,
						seasonIdx,
						seasonYear: teamData.seasons[seasonIdx].season,
						seasons
					}
				};
			}
			return {
				status: res.status,
				error: new Error(`Could not load ${apiUrl}`)
			};
		} else {
			const apiUrl = `/teams/${params.teamSlug}.json`;
			const res = await fetch(apiUrl);
			if (res.ok) {
				const { teamData } = await res.json();
				const seasonIdx = 0;
				const seasons: SeasonList[] = [];
				teamData.seasons.map((s) => {
					const { season } = s;
					seasons.push({ season });
				});
				seasons.sort((a, b) => a.season - b.season);
				return {
					props: {
						teamData,
						seasonIdx,
						seasonYear: teamData.seasons[seasonIdx].season,
						seasons
					}
				};
			}
			return {
				status: res.status,
				error: new Error(`Could not load ${apiUrl}`)
			};
		}
	};
</script>

<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ScheduleTable from '$lib/ux/tables/teams/Schedule.svelte';
	import PlayerRoster from '$lib/ux/tables/teams/PlayerRoster.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import RectBg from '$lib/ux/svg/RectBg.svelte';
	import TeamLogo from '$lib/ux/teams/assets/AnyTeamLogo.svelte';
	import Table from '$lib/ux/tables/core/Table.svelte';
	import THead from '$lib/ux/tables/core/THead.svelte';
	import type { Team2Document } from '@balleranalytics/nba-api-ts';
	import type { TeamColor } from '$lib/types';
	import TabPanel from '$lib/ux/tabs/TabPanel.svelte';
	import TabList from '$lib/ux/tabs/TabList.svelte';
	import Tabs from '$lib/ux/tabs/Tabs.svelte';
	import Color from 'color';
	import { tweened } from 'svelte/motion';
	import { interpolateLab as interpolate } from 'd3-interpolate';
	import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/env';
	import { genPalette, getBackgroundColors } from '$lib/ux/svg/core/colors';
	import type { IColHeader } from '$lib/ux/tables/types';
	export let teamData;
	export let seasonIdx: number;
	export let seasonYear: number;
	export let seasons: SeasonList[];

	const colHeaders: IColHeader[] = [
		{ title: 'Date/Time (ET)' },
		{ title: 'Opponent' },
		{ title: 'Result' },
		{ title: 'W - L' }
	];
	let bgInner = tweened(darkMode ? '#000' : '#fff', { duration: 200, interpolate }),
		bgOuter = tweened(darkMode ? '#000' : '#fff', { duration: 200, interpolate });
	const { hex: primaryColor, rgb: color1 } = getMainColor(
		teamData.infoCommon.nbaAbbreviation
	) as unknown as TeamColor;
	const { hex: secondaryColor, rgb: color2 } = getSecondaryColor(
		teamData.infoCommon.nbaAbbreviation
	) as unknown as TeamColor;
	const colorPalette = genPalette(Color(primaryColor), Color(secondaryColor), 5);
	if (browser) {
		const background = getBackgroundColors(colorPalette);
		$bgInner = background.bgInner;
		$bgOuter = background.bgOuter;
	}

	async function loadRosterData() {
		const seasonIndex = teamData.seasons.findIndex((s) => s.season === seasonYear);
		const res = await fetch(`/teams/${teamData.infoCommon.slug}.json?seasonIdx=${seasonIndex}`);
		const { teamData: data }: { teamData: Team2Document } = await res.json();
		teamData = data;
		seasonIdx = seasonIndex;
	}
</script>

<MetaTags
	title="{seasonYear} {teamData.infoCommon.name} Season Basic Info"
	description="Team Schedule, Roster, and Statistics for the {teamData.infoCommon
		.name}'s {seasonYear} season."
/>

<RectBg selectedTeam={teamData} />

<div class="appContent">
	<div class="p-2">
		<div
			class="glassmorphicCard mx-auto flex flex-wrap gap-6 py-6 justify-center mb-6 items-center px-2 md:(container mx-auto)"
		>
			<div
				class="h-30 w-30 md:(h-50 w-50) rounded-lg dark:(bg-white backdrop-filter backdrop-blur-sm bg-opacity-10)"
			>
				<TeamLogo size={'100%'} {logoModules} slug={teamData.infoCommon.slug} />
			</div>
			<h1 class="text-dark-600 dark:text-light-200">
				{teamData.infoCommon.name}
			</h1>
		</div>
		<div class="p-2 md:(container mx-auto)">
			<div class="glassmorphicCard flex inline-flex items-center px-4 py-2 text-black mb-6">
				<label class="text-dark-600 dark:text-light-200 text-lg mr-4" for="season-select"
					>Season:</label
				>

				<select type="select" id="season-select" bind:value={seasonYear} on:change={loadRosterData}>
					{#each seasons as { season }}
						<option value={season}>{season}</option>
					{/each}
				</select>
			</div>
			<Tabs>
				<div class="w-full glassmorphicCard mx-1 px-2 py-1 md:w-auto">
					<TabList
						primaryColor={color1}
						secondaryColor={color2}
						links={[{ title: 'Schedule' }, { title: 'Roster' }, { title: 'Stats' }]}
					/>
				</div>

				<!-- Schedule Data Tab -->
				<TabPanel>
					{#if teamData.seasons[seasonIdx].regularSeason.games.length > 0}
						<div class="glassmorphicCard px-4 py-2 my-5">
							<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">
								{teamData.seasons[seasonIdx].season} Regular Season:
							</h2>
						</div>
						<div class="my-4">
							<ScheduleTable
								{logoModules}
								schedule={teamData.seasons[seasonIdx].regularSeason.games}
								teamId={teamData._id}
							/>
						</div>
					{:else}
						<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">
							No games played in {teamData.seasons[seasonIdx].season}
						</h2>
					{/if}
					{#if teamData.seasons[seasonIdx].postseason.games.length > 0}
						<div class="glassmorphicCard px-4 py-2 my-5">
							<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">
								{teamData.seasons[seasonIdx].season} Postseason:
							</h2>
						</div>
						<div class="my-4">
							<ScheduleTable
								{logoModules}
								schedule={teamData.seasons[seasonIdx].postseason.games}
								teamId={teamData._id}
							/>
						</div>
					{/if}
				</TabPanel>

				<!-- Roster Data Tab -->
				<TabPanel>
					<div class="glassmorphicCard px-4 py-2 my-5">
						<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">Roster:</h2>
					</div>
					<PlayerRoster roster={teamData.seasons[seasonIdx].roster.players} />
				</TabPanel>

				<!-- Stats Data Tab -->
				<TabPanel>
					<div class="glassmorphicCard px-4 py-2 my-5">
						<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">Stats:</h2>
					</div>
					<Table>
						<THead slot="thead" {colHeaders} />
					</Table>
				</TabPanel>
			</Tabs>
		</div>
	</div>
</div>

<style>
	.tabPanelTitle {
		@apply text-center m-4;
	}
</style>
