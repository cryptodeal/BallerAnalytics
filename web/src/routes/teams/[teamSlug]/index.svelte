<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { SeasonList } from '$lib/types';

	export const load: Load = async ({ fetch, page }) => {
		if (page.query.has('seasonIdx')) {
			const url = `/teams/${page.params.teamSlug}.json?seasonIdx=${page.query.get('seasonIdx')}`;
			const res = await fetch(url);

			if (res.ok) {
				const { teamData } = await res.json();
				const seasonIdx = page.query.get('seasonIdx');
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
				error: new Error(`Could not load ${url}`)
			};
		}
	};
</script>

<script lang="ts">
	import ScheduleTable from '$lib/ux/teams/ScheduleTable.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import type { Team2Document } from '@balleranalytics/nba-api-ts';
	import type { TeamColor } from '$lib/types';
	import { Tabs, TabList, TabPanel } from '$lib/ux/tabs';
	export let teamData;
	export let seasonIdx: number;
	export let seasonYear: number;
	export let seasons: SeasonList[];

	const { rgb: color1 } = getMainColor(teamData.infoCommon.nbaAbbreviation) as unknown as TeamColor;
	const { hex: secondaryColor, rgb: color2 } = getSecondaryColor(
		teamData.infoCommon.nbaAbbreviation
	) as unknown as TeamColor;

	async function loadRosterData() {
		const seasonIndex = teamData.seasons.findIndex((s) => s.season === seasonYear);
		const res = await fetch(`/teams/${teamData.infoCommon.slug}.json?seasonIdx=${seasonIndex}`);
		const { teamData: data }: { teamData: Team2Document } = await res.json();
		teamData = data;
		seasonIdx = seasonIndex;
	}
</script>

<div
	class="w-full h-full overflow-scroll bg-opacity-10"
	style="color:#fcfcfc;background-color:rgba(8, 15, 53, 1);background-repeat:no-repeat;
  background:linear-gradient(180deg, rgba({color1[0]}, {color1[1]}, {color1[2]}, 0.9) 1%, rgba({color2[0]}, {color2[1]}, {color2[2]}, .02) 100%),
  linear-gradient(333deg, rgba(153, 207, 255, 0.2), rgba(180, 255, 217, 0.08)),
  radial-gradient(circle at 77% 89%, rgba(125, 163, 169, 0.8), rgba(125, 163, 169, 0) 50%),
  radial-gradient(circle at 15% 95%, rgba(125, 163, 169, 0.8), rgba(125, 163, 169, 0) 43%),
  radial-gradient(circle at 65% 23%, rgba(137, 151, 119, 0.4), rgba(137, 151, 119, 0) 70%),
  radial-gradient(circle at 10% 0%, rgba(187, 211, 204, 0.33), rgba(187, 211, 204, 0) 35%),
  radial-gradient(circle at 11% 100%, rgba(131, 165, 203, 0.3), rgba(131, 165, 203, 0) 30%);"
>
	<div class="appContent">
		<div class="w-full h-full p-2">
			<div
				class="flex flex-wrap justify-center text-center opacity-100 items-center min-h-25 md:h-50"
			>
				<img
					class="bg-light-200 rounded-lg bg-opacity-20 backdrop-filter backdrop-blur-lg h-30 w-auto mx-10 p-1 md:(mx-20 h-full w-auto)"
					src="/teams/{teamData.infoCommon.slug}.svg"
					alt="{teamData.infoCommon.city} {teamData.infoCommon.name} logo"
				/>
				<h1 style="color:rgba({color2[0]}, {color2[1]}, {color2[2]}, 1);">
					{teamData.infoCommon.name}
				</h1>
			</div>
			<div class="p-2 md:(container mx-auto)">
				<div class="flex inline-flex items-center text-black">
					<div>
						<h2 class="text-white text-lg mr-4">Season:</h2>
					</div>
					<select class="select" bind:value={seasonYear} on:change={loadRosterData}>
						{#each seasons as { season }}
							<option value={season}>{season}</option>
						{/each}
					</select>
				</div>
				<Tabs>
					<TabList
						primaryColor={color1}
						secondaryColor={color2}
						links={[{ title: 'Schedule' }, { title: 'Roster' }, { title: 'Stats' }]}
					/>

					<!-- Schedule Data Tab -->
					<TabPanel>
						<h2 class="tabPanelTitle" style="color:{secondaryColor};">
							{teamData.seasons[seasonIdx].season} Regular Season:
						</h2>
						<ScheduleTable
							schedule={teamData.seasons[seasonIdx].regularSeason.games}
							teamId={teamData._id}
						/>
					</TabPanel>

					<!-- Roster Data Tab -->
					<TabPanel>
						<h2 class="tabPanelTitle" style="color:{secondaryColor};">Roster:</h2>
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
