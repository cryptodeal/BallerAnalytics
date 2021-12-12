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
	import PlayerStatsTable from '$lib/teams/roster/PlayerStatsTable.svelte';
	import SchedTable from '$lib/teams/schedule/SchedTable.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import { getAge, getAstTovRatio } from '$lib/_utils/helpers';
	import { Tabs, TabList, TabPanel, Tab } from '$lib/_utils/tabs.js';
	export let teamData;
	//console.log(teamData);
	let seasonYear = teamData.seasons[teamData.seasons.length - 1].season;
	let seasonData = teamData.seasons[teamData.seasons.length - 1];
	seasonData.roster.players.sort((a, b) =>
		a.player.name.fullName > b.player.name.fullName
			? 1
			: b.player.name.fullName > a.player.name.fullName
			? -1
			: 0
	);
	$: console.log(seasonData);
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
		player.gamesPlayed = 0;
		player.minutes = 0;
		player.pts = 0;
		player.oreb = 0;
		player.dreb = 0;
		player.reb = 0;
		player.ast = 0;
		player.stl = 0;
		player.blk = 0;
		player.tov = 0;
		player.pf = 0;
		player.astTovRatio = 0;
		for (let j = 0; j < player.player.seasons.length; j++) {
			if (
				player.player.seasons[j].season === seasonYear.toString() &&
				player.player.seasons[j].stats
			) {
				player.gamesPlayed = player.player.seasons[j].stats.gamesPlayed.value;
				player.minutes = player.player.seasons[j].stats.minutes.value;
				player.pts = player.player.seasons[j].stats.pts.value;
				player.oreb = player.player.seasons[j].stats.oreb.value;
				player.dreb = player.player.seasons[j].stats.dreb.value;
				player.reb = player.player.seasons[j].stats.reb.value;
				player.ast = player.player.seasons[j].stats.ast.value;
				player.stl = player.player.seasons[j].stats.stl.value;
				player.blk = player.player.seasons[j].stats.blk.value;
				player.tov = player.player.seasons[j].stats.tov.value;
				player.pf = player.player.seasons[j].stats.pf.value;
				player.astTovRatio = getAstTovRatio(player.ast, player.tov);
			}
		}
	});

	async function loadRosterData() {
		let res = await fetch(
			`/api/teams/${teamData.infoCommon.slug}/season.json?season=${seasonYear}`
		);

		res = await res.json();
		console.log(res.seasonData);
		res.seasonData.roster.players = res.seasonData.roster.players.sort((a, b) =>
			a.player.name.fullName > b.player.name.fullName
				? 1
				: b.player.name.fullName > a.player.name.fullName
				? -1
				: 0
		);
		seasonData = res.seasonData;
	}
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
	<Tabs>
		<TabList color={getSecondaryColor(teamData.infoCommon.abbreviation).hex}>
			<Tab color={getSecondaryColor(teamData.infoCommon.abbreviation).hex}>Roster</Tab>
			<Tab color={getSecondaryColor(teamData.infoCommon.abbreviation).hex}>Stats</Tab>
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
						<h2 class="text-white text-lg">Player Stats - All Splits</h2>
					</div>
					<PlayerStatsTable players={seasonData.roster.players} season={seasonYear} />
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
