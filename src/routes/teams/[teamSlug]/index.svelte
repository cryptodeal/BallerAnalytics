<script context="module">
	export async function load({ fetch, page }) {
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
	}
</script>

<script>
	import PlayersTable from '$lib/teams/roster/PlayersTable.svelte';
	import CoachesTable from '$lib/teams/roster/CoachesTable.svelte';
	import { getMainColor } from 'nba-color';
	export let teamData;
	let seasonYear = teamData.seasons[teamData.seasons.length - 1].season;
	let seasonData = teamData.seasons[teamData.seasons.length - 1];
	console.log(seasonData);

	async function loadRosterData() {
		let res = await fetch(
			`/api/teams/${teamData.infoCommon.slug}/roster.json?season=${seasonYear}`
		);
		res = await res.json();
		seasonData = res.seasonData;
		console.log(seasonData);
	}
</script>

<div
	class="w-full m-0 p-0 "
	style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
>
	<div class="container max-w-4xl mx-auto text-center break-normal">
		<h1 class="font-sans py-10 text-white font-bold text-3xl md:(text-5xl py-20)">
			{teamData.infoCommon.city}
			{teamData.infoCommon.name}
		</h1>
	</div>
</div>

<div
	class="container mx-auto my-4"
	style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
>
	<div class="flex flex-wrap">
		<div>
			<h2 class="text-white text-lg mr-4">Season:</h2>
		</div>
		<select class="select" bind:value={seasonYear} on:blur={loadRosterData}>
			{#each teamData.seasons as { season }, i}
				<option value={season}>{season}</option>
			{/each}
		</select>
	</div>
</div>
<div class="container mx-auto my-4">
	<div
		class="flex flex-wrap my-4"
		style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
	>
		<h2 class="text-white text-lg">Team Roster</h2>
	</div>
	<PlayersTable players={seasonData.roster.players} />
	<div
		class="flex flex-wrap my-4"
		style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
	>
		<h2 class="text-white text-lg">Coaching Staff</h2>
	</div>
	<CoachesTable coaches={seasonData.roster.coaches} />
</div>
