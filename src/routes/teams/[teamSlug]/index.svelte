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
	import { getAge } from '$lib/_utils/helpers';
	export let teamData;
	let seasonYear = teamData.seasons[teamData.seasons.length - 1].season;
	let seasonData = teamData.seasons[teamData.seasons.length - 1];
	$: seasonData.roster.players.forEach((player, i) => {
		const heightSplit = player.player.height.split('-');
		const heightInches = parseInt(heightSplit[0]) * 12 + parseInt(heightSplit[1]);
		player.id = i;
		player.age = getAge(player.player.birthdate);
		player.height = player.player.height;
		player.heightSortHelper = heightInches;
		player.weight = player.player.weight;
		player.fullName = player.player.name.fullName;
		player.school = player.player.school;
	});

	async function loadRosterData() {
		let res = await fetch(
			`/api/teams/${teamData.infoCommon.slug}/roster.json?season=${seasonYear}`
		);
		res = await res.json();
		seasonData = res.seasonData;
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
		<select class="select" bind:value={seasonYear} on:change={loadRosterData}>
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
	<PlayersTable players={seasonData.roster.players} season={seasonYear} />
	<div
		class="flex flex-wrap my-4"
		style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
	>
		<h2 class="text-white text-lg">Coaching Staff</h2>
	</div>
	<CoachesTable coaches={seasonData.roster.coaches} />
</div>
