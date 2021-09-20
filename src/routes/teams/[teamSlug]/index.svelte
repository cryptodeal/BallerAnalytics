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
	import Headshot from '$lib/img/Headshot.svelte';
	export let teamData;
	//let selected
	//$: selectedIndex = teamData.seasons.length - 1
	//$: console.log(selectedIndex)
	console.log(teamData.seasons[teamData.seasons.length - 1].roster);
</script>

<div class="w-full m-0 p-0 bg-red-900">
	<div class="container max-w-4xl mx-auto text-center break-normal">
		<h1 class="font-sans py-10 text-white font-bold text-3xl md:(text-5xl py-20)">
			{teamData.infoCommon.city}
			{teamData.infoCommon.name}
		</h1>
	</div>
</div>

<!--
<select bind:value={selected}>
  {#each teamData.seasons as {season}, i}
    <option value={season} on:change="{() => selectedIndex = i}">
      {season}-{parseInt(season.substring(2,4))+1}
    </option>
  {/each}
</select>
-->

{#each teamData.seasons[teamData.seasons.length - 1].roster.players as { player, number, position }}
	<div class="container mx-auto my-4">
		<!--<a sveltekit:prefetch href="/teams/{infoCommon.slug}">-->
		<div class="rounded-lg shadow-lg bg-gray-600 w-full flex flex-row flex-wrap p-3">
			<div class="md:w-1/8 w-full">
				<Headshot
					src="https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/{player._id}.png"
					alt="{player.name.fullName} headshot"
				/>
			</div>
			<div class="md:w-7/8 w-full px-3 flex flex-row flex-wrap">
				<div
					class="w-full text-center text-gray-700 font-semibold relative pt-3 md:(pt-0 text-right)"
				>
					<div class="text-2xl text-white leading-tight">{player.name.fullName}</div>
					<div class="text-normal text-gray-300 hover:text-gray-400 cursor-pointer">
						<span class="pb-1">Position: {position}</span>
						{#if number !== null}
							<br />
							<span class="pb-1">Number: {number}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<!--</a>-->
	</div>
{/each}
