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
	import { getMainColor } from 'nba-color';
	export let teams: Team2Document[];
</script>

<div class="w-full h-full pt-14">
	{#each teams as { infoCommon }}
		<div class="container mx-auto my-4">
			<a sveltekit:prefetch href="/teams/{infoCommon.slug}">
				<div
					style="background-color:{getMainColor(infoCommon.abbreviation)?.hex
						? getMainColor(infoCommon.abbreviation).hex
						: '#A1A1AA'};"
					class="rounded-lg shadow-lg backdrop-filter backdrop-blur-xl bg-opacity-20 w-full flex flex-wrap p-3"
				>
					<div class="md:w-1/8 w-full">
						<img
							class="rounded-lg shadow-sm mx-auto max-h-30 antialiased bg-gray-600 backdrop-filter backdrop-blur-lg bg-opacity-20 md:m-4"
							src="teams/{infoCommon.slug}.svg"
							alt="{infoCommon.name} logo"
						/>
					</div>
					<div class="md:w-7/8 w-full h-full px-3 flex flex-row flex-wrap">
						<div
							class="w-full text-center text-gray-700 font-semibold relative pt-3 md:(pt-0 text-right)"
						>
							<div class="text-2xl text-dark-700 dark:text-light-200 leading-tight">
								{infoCommon.name}
							</div>
							<div class="text-normal text-gray-500 dark:text-gray-300 cursor-pointer">
								<span class="pb-1">{infoCommon.minYear} - {infoCommon.maxYear}</span>
							</div>
						</div>
					</div>
				</div>
			</a>
		</div>
	{/each}
</div>
