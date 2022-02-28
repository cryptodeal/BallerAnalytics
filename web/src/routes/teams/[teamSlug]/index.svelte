<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { SeasonList } from '$lib/types';

	export const load: Load = async ({ fetch, params, url }) => {
		if (url.searchParams.get('seasonIdx')) {
			const apiUrl = `/teams/${params.teamSlug}.json?seasonIdx=${url.searchParams.get(
				'seasonIdx'
			)}`;
			const module = await import(`../../../lib/ux/teams/assets/logo-${params.teamSlug}.svelte`);
			const res = await fetch(apiUrl);
			if (res.ok && module) {
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
						seasons,
						Logo: module.default
					}
				};
			}
			return {
				status: res.status,
				error: new Error(`Could not load ${apiUrl}`)
			};
		} else {
			const apiUrl = `/teams/${params.teamSlug}.json`;
			const module = await import(`../../../lib/ux/teams/assets/logo-${params.teamSlug}.svelte`);
			const res = await fetch(apiUrl);
			if (res.ok && module) {
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
						seasons,
						Logo: module.default
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
	import ScheduleTable from '$lib/ux/teams/ScheduleTable.svelte';
	import PlayerRosterTable from '$lib/ux/teams/roster/Players.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import RectBg from '$lib/ux/svg/RectBg.svelte';
	import type { Team2Document } from '@balleranalytics/nba-api-ts';
	import type { TeamColor } from '$lib/types';
	import { Tabs, TabList, TabPanel } from '$lib/ux/tabs';
	import Color from 'color';
	import { tweened } from 'svelte/motion';
	import { interpolateLab as interpolate } from 'd3-interpolate';
	import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/env';
	import { genPalette, getBackgroundColors } from '$lib/ux/teams/genBg/core/colors';
	export let teamData;
	export let seasonIdx: number;
	export let seasonYear: number;
	export let seasons: SeasonList[];
	export let Logo;
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

<div class="w-full h-full overflow-scroll">
	<div class="appContent">
		<div class="w-full h-full p-2">
			<div
				class="glassmorphicCard mx-auto flex flex-wrap gap-3 my-3 justify-center text-center opacity-100 items-center min-h-25 sm:max-w-3/4 md:(h-50 max-w-1/2) 2xl:max-w-1/4"
			>
				<div class="shadow-sm antialiased h-30 p-1 md:h-full">
					{#if Logo}
						<Logo size={200} />
					{/if}
				</div>
				<h1 style="color:rgba({color2[0]}, {color2[1]}, {color2[2]}, 1);">
					{teamData.infoCommon.name}
				</h1>
			</div>
			<div class="p-2 md:(container mx-auto)">
				<div class="flex glassmorphicCard inline-flex items-center px-4 py-2 text-black">
					<h2 class="text-white text-lg mr-4">Season:</h2>
					<select class="select" bind:value={seasonYear} on:change={loadRosterData}>
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
							color1={primaryColor}
							links={[{ title: 'Schedule' }, { title: 'Roster' }, { title: 'Stats' }]}
						/>
					</div>

					<!-- Schedule Data Tab -->
					<TabPanel>
						{#if teamData.seasons[seasonIdx].regularSeason.games.length > 0}
							<h2 class="tabPanelTitle" style="color:{secondaryColor};">
								{teamData.seasons[seasonIdx].season} Regular Season:
							</h2>
							<div class="my-4">
								<ScheduleTable
									schedule={teamData.seasons[seasonIdx].regularSeason.games}
									teamId={teamData._id}
								/>
							</div>
						{:else}
							<h2 class="tabPanelTitle" style="color:{secondaryColor};">
								No games played in {teamData.seasons[seasonIdx].season}
							</h2>
						{/if}
						{#if teamData.seasons[seasonIdx].postseason.games.length > 0}
							<h2 class="tabPanelTitle" style="color:{secondaryColor};">
								{teamData.seasons[seasonIdx].season} Postseason:
							</h2>
							<div class="my-4">
								<ScheduleTable
									schedule={teamData.seasons[seasonIdx].postseason.games}
									teamId={teamData._id}
								/>
							</div>
						{/if}
					</TabPanel>

					<!-- Roster Data Tab -->
					<TabPanel>
						<h2 class="tabPanelTitle" style="color:{secondaryColor};">Roster:</h2>
						<PlayerRosterTable roster={teamData.seasons[seasonIdx].roster.players} />
					</TabPanel>

					<!-- Stats Data Tab -->
					<TabPanel>
						<h2 class="tabPanelTitle" style="color:{secondaryColor};">Stats:</h2>
					</TabPanel>
				</Tabs>
			</div>
		</div>
	</div>
</div>

<style>
	.tabPanelTitle {
		@apply text-center m-4;
	}
</style>
