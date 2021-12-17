<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ fetch, page }) => {
		const url = `/teams/${page.params.teamSlug}.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { teamData } = await res.json();
			console.log(teamData);
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
	import { getMainColor } from 'nba-color';
	//import { getAge, getAstTovRatio } from '$lib/functions/helpers';
	//import { Tabs, TabList, TabPanel, Tab } from '$lib/ux/tabs';
	export let teamData;
</script>

<div
	class="w-full m-0 p-0"
	style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
>
	<div class="flex flex-wrap justify-center align-center min-h-25 md:h-50">
		<img
			class="shadow-lg mx-4 h-25 md:(mr-4 h-full) antialiased"
			src="/teams/{teamData.infoCommon.slug}.svg"
			alt="{teamData.infoCommon.city} {teamData.infoCommon.name} logo"
		/>
		<div>
			<h1 class="font-sans text-white py-5 font-bold text-3xl md:(text-5xl py-20)">
				{teamData.infoCommon.city}
				{teamData.infoCommon.name}
			</h1>
		</div>
	</div>
</div>
