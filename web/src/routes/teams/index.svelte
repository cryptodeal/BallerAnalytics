<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Team2Document } from '@balleranalytics/nba-api-ts';

	export const load: Load = async ({ fetch }) => {
		const url = `teams.json`;
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

<div class="appContent">
	{#each teams as { infoCommon, seasons }}
		<div class="container mx-auto my-4">
			<a
				sveltekit:prefetch
				href="teams/{infoCommon.slug}?seasonIdx={seasons.findIndex(
					(s) =>
						s.season ==
						Math.max.apply(
							Math,
							seasons.map((s) => {
								return s.season;
							})
						) -
							1
				)}"
			>
				<div
					style="background-color:{getMainColor(infoCommon.nbaAbbreviation)
						.hex};border-color:{getSecondaryColor(infoCommon.nbaAbbreviation).hex};"
					class="rounded-lg shadow-lg border-2 w-full flex flex-wrap gap-y-4 p-3 md:(flex-row)"
				>
					<div class="md:(w-1/8) w-full">
						<img
							class="rounded-lg shadow-sm mx-auto h-30 antialiased bg-white backdrop-filter backdrop-blur-lg bg-opacity-35 md:m-4"
							src="/teams/assets/logo-{infoCommon.slug}.svg"
							alt="{infoCommon.name} logo"
						/>
					</div>
					<div
						class="md:(w-7/8 justify-end) w-full mx-auto px-3 flex inline-flex h-auto justify-center"
					>
						<div
							class="rounded-lg my-auto text-black p-2 bg-white backdrop-filter backdrop-blur-lg bg-opacity-35 text-center font-semibold pt-3 md:text-right"
						>
							<div class="text-2xl leading-tight">
								{infoCommon.name}
							</div>
							<div class="text-normal cursor-pointer">
								<span
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
