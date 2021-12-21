<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Team2Document } from '@balleranalytics/nba-api-ts';

	export const load: Load = async ({ fetch }) => {
		const url = `/teams.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { teams }: { teams: Team2Document[] } = await res.json();
			return {
				props: {
					teams
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
	import { getMainColor, getSecondaryColor } from 'nba-color';
	export let teams: Team2Document[];
</script>

<div class="w-full h-full pt-14">
	{#each teams as { infoCommon, seasons }}
		<div class="container mx-auto my-4">
			<a sveltekit:prefetch href="/teams/{infoCommon.slug}">
				<div
					style="background-color:{getMainColor(infoCommon.nbaAbbreviation)
						.hex};border-color:{getSecondaryColor(infoCommon.nbaAbbreviation).hex};"
					class="rounded-lg shadow-lg backdrop-filter backdrop-blur-xl bg-opacity-20 border-1 w-full flex flex-wrap p-3"
				>
					<div class="md:(w-1/8) w-full">
						<img
							class="rounded-lg shadow-sm mx-auto h-30 antialiased bg-white backdrop-filter backdrop-blur-lg bg-opacity-35 md:m-4"
							src="teams/{infoCommon.slug}.svg"
							alt="{infoCommon.name} logo"
						/>
					</div>
					<div class="md:w-7/8 w-full h-full px-3 flex flex-row flex-wrap justify-end">
						<div
							class="w-auto rounded-lg text-black p-2 bg-white backdrop-filter backdrop-blur-lg bg-opacity-35 text-center font-semibold relative pt-3 md:text-right"
						>
							<div class="text-2xl leading-tight">
								{infoCommon.name}
							</div>
							<div class="text-normal cursor-pointer">
								<span class="pb-1"
									>{seasons.reduce((prev, curr) => {
										return prev.season < curr.season ? prev : curr;
									}).season - 1} - {seasons.reduce((prev, curr) => {
										return prev.season > curr.season ? prev : curr;
									}).season}</span
								>
							</div>
						</div>
					</div>
				</div>
			</a>
		</div>
	{/each}
</div>
