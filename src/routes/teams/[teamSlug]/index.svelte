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
	import SchedTable from '$lib/teams/schedule/SchedTable.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import { getAge } from '$lib/_utils/helpers';
	import { Tabs, TabList, TabPanel, Tab } from '$lib/_utils/tabs.js';
	export let teamData;
	//console.log(schedule)
	let seasonYear = teamData.seasons[teamData.seasons.length - 1].season;
	let seasonData = teamData.seasons[teamData.seasons.length - 1];
	//$: console.log(seasonData);
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
	//$: console.log(schedule)
	//$: regularSched = schedule.filter((game) => !game.preseason);

	async function loadRosterData() {
		let res = await fetch(
			`/api/teams/${teamData.infoCommon.slug}/season.json?season=${seasonYear}`
		);

		res = await res.json();
		seasonData = res.seasonData;
	}
</script>

<div
	class="w-full m-0 p-0"
	style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
>
	<div class="container max-w-4xl mx-auto text-center break-normal">
		<div class="flex flex-wrap justify-center align-center h-25 md:h-50">
			<img
				class="shadow-lg mx-4 h-full md:mr-4 antialiased"
				src="/teams/{teamData.infoCommon.slug}.svg"
				alt="{teamData.infoCommon.city} {teamData.infoCommon.name} logo"
			/>
			<div>
				<h1 class="font-sans text-white py-10 font-bold text-3xl md:(text-5xl py-20)">
					{teamData.infoCommon.city}
					{teamData.infoCommon.name}
				</h1>
			</div>
		</div>
	</div>
	<Tabs>
		<TabList color={getSecondaryColor(teamData.infoCommon.abbreviation).hex}>
			<Tab color={getSecondaryColor(teamData.infoCommon.abbreviation).hex}>Roster</Tab>
			<Tab color={getSecondaryColor(teamData.infoCommon.abbreviation).hex}>Schedule</Tab>
		</TabList>

		<TabPanel>
			<div class="bg-gray-100 pt-4">
				<div
					class="container mx-auto mb-4"
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
			</div>
		</TabPanel>

		<TabPanel>
			<div class="bg-gray-100 pt-4">
				<div
					class="container mx-auto mb-4"
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
						<h2 class="text-white text-lg">Preseason Schedule</h2>
					</div>
					<SchedTable schedule={seasonData.games.preseason} teamId={teamData._id} />

					<div
						class="flex flex-wrap my-4"
						style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
					>
						<h2 class="text-white text-lg">Regular Season Schedule</h2>
					</div>
					<SchedTable schedule={seasonData.games.regularSeason} teamId={teamData._id} />

					{#if seasonData.games.postseason.length}
						<div
							class="flex flex-wrap my-4"
							style="background-color:{getMainColor(teamData.infoCommon.abbreviation).hex}"
						>
							<h2 class="text-white text-lg">Postseason Schedule</h2>
						</div>
						<SchedTable schedule={seasonData.games.postseason} teamId={teamData._id} />
					{/if}
				</div>
			</div>
		</TabPanel>
	</Tabs>
</div>
