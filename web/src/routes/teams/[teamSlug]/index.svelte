<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ fetch, page }) => {
		const url = `/teams/${page.params.teamSlug}.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { teamData } = await res.json();
			return {
				props: {
					teamData
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	import ScheduleTable from '$lib/ux/teams/ScheduleTable.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import type { TeamColor } from '$lib/types';
	import { Tabs, TabList, TabPanel } from '$lib/ux/tabs';
	export let teamData;
	const { hex: primaryColor, rgb: color1 } = getMainColor(
		teamData.infoCommon.nbaAbbreviation
	) as unknown as TeamColor;
	const { hex: secondaryColor, rgb: color2 } = getSecondaryColor(
		teamData.infoCommon.nbaAbbreviation
	) as unknown as TeamColor;
</script>

<div
	class="w-full h-full overflow-scroll"
	style="color:#fcfcfc;background-color:rgba(8, 15, 53, 1);background-repeat:no-repeat;
  background-image:linear-gradient(180deg, rgba({color1[0]}, {color1[1]}, {color1[2]}, 0.9) 1%, rgba({color2[0]}, {color2[1]}, {color2[2]}, .8) 100%),
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
				<Tabs>
					<TabList
						{primaryColor}
						{secondaryColor}
						links={[{ title: 'Schedule' }, { title: 'Roster' }, { title: 'Stats' }]}
					/>

					<!-- Schedule Data Tab -->
					<TabPanel>
						<h2 class="tabPanelTitle" style="color:{secondaryColor};">Regular Season:</h2>
						<ScheduleTable
							schedule={teamData.seasons[teamData.seasons.length - 2].regularSeason.games}
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
