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
	//import PlayersTable from '$lib/teams/roster/PlayersTable.svelte';
	//import CoachesTable from '$lib/teams/roster/CoachesTable.svelte';
	//import PlayerStatsTable from '$lib/teams/roster/PlayerStatsTable.svelte';
	//import SchedTable from '$lib/teams/schedule/SchedTable.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import type { TeamColor } from '$lib/types';
	//import { getAge, getAstTovRatio } from '$lib/functions/helpers';
	//import { Tabs, TabList, TabPanel, Tab } from '$lib/ux/tabs';
	export let teamData;
	const { rgb: color1 } = getMainColor(teamData.infoCommon.abbreviation) as unknown as TeamColor;
	const { rgb: color2 } = getSecondaryColor(
		teamData.infoCommon.abbreviation
	) as unknown as TeamColor;
</script>

<div
	class="w-full h-full"
	style="color:#fcfcfc;background-color:rgba(8, 15, 53, 1);background-repeat:no-repeat;
  background-image:linear-gradient(180deg, rgba({color1[0]}, {color1[1]}, {color1[2]}, 0.9) 1%, rgba({color2[0]}, {color2[1]}, {color2[2]}, .8) 100%),
  linear-gradient(333deg, rgba(153, 207, 255, 0.2), rgba(180, 255, 217, 0.08)),
  radial-gradient(circle at 77% 89%, rgba(125, 163, 169, 0.8), rgba(125, 163, 169, 0) 50%),
  radial-gradient(circle at 15% 95%, rgba(125, 163, 169, 0.8), rgba(125, 163, 169, 0) 43%),
  radial-gradient(circle at 65% 23%, rgba(137, 151, 119, 0.4), rgba(137, 151, 119, 0) 70%),
  radial-gradient(circle at 10% 0%, rgba(187, 211, 204, 0.33), rgba(187, 211, 204, 0) 35%),
  radial-gradient(circle at 11% 100%, rgba(131, 165, 203, 0.3), rgba(131, 165, 203, 0) 30%);"
>
	<div class="w-full m-0 p-0 py-5 md:py-10">
		<div class="flex flex-wrap justify-center opacity-100 items-center min-h-25 md:h-50">
			<img
				class="shadow-lg mx-10 h-30 md:(mx-20 h-full) antialiased"
				src="/teams/{teamData.infoCommon.slug}.svg"
				alt="{teamData.infoCommon.city} {teamData.infoCommon.name} logo"
			/>
			<h1 class="font-sans font-bold text-white text-3xl md:(text-5xl py-20)">
				{teamData.infoCommon.name}
			</h1>
		</div>
	</div>
</div>
