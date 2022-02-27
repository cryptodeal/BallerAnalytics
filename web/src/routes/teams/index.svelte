<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Team2Document } from '@balleranalytics/nba-api-ts';
	export const logoModules = import.meta.globEager('../../lib/ux/teams/assets/logo-*.svelte');
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

<svelte:head>
	<title
		>NBA {Math.max.apply(
			Math,
			teams[0].seasons.map(function (o) {
				return o.season;
			})
		) - 1}-{`${Math.max.apply(
			Math,
			teams[0].seasons.map(function (o) {
				return o.season;
			})
		)}`.substring(-2)} Teams</title
	>
	<html lang="en" />
	<meta
		name="Description"
		content="Index of teams from the {Math.max.apply(
			Math,
			teams[0].seasons.map(function (o) {
				return o.season;
			})
		) - 1}-{`${Math.max.apply(
			Math,
			teams[0].seasons.map(function (o) {
				return o.season;
			})
		)}`.substring(-2)} NBA season."
	/>
</svelte:head>

<div class="appContent flex flex-col">
	{#each teams as { infoCommon, seasons }}
		<div class="container mx-auto my-4">
			<a sveltekit:prefetch href="teams/{infoCommon.slug}">
				<div
					style="background-color:{getMainColor(infoCommon.nbaAbbreviation)
						.hex};border-color:{getSecondaryColor(infoCommon.nbaAbbreviation).hex};"
					class="rounded-lg shadow-lg border-2 w-full flex flex-wrap gap-y-4 p-3 md:(flex-row)"
				>
					<div class="md:(w-1/8) w-1/2 mx-auto px-2">
						{#if logoModules}
							{#each Object.entries(logoModules) as [key, { default: Logo }]}
								{#if key.includes(`logo-${infoCommon.slug}.svelte`)}
									<div class="mx-auto">
										<Logo size={200} />
									</div>
								{/if}
							{/each}
						{/if}
					</div>
					<div
						class="md:(w-7/8 justify-end) w-full mx-auto px-3 flex inline-flex h-auto justify-center"
					>
						<div
							class="rounded-lg backdrop-blur-xl backdrop-filter bg-opacity-40 my-auto p-2 text-center font-semibold pt-3 md:text-right"
							style="background-color:{getSecondaryColor(infoCommon.nbaAbbreviation).hex ===
								'#000000' ||
							(getSecondaryColor(infoCommon.nbaAbbreviation).hex !== '#000000' &&
								getSecondaryColor(infoCommon.nbaAbbreviation).hex !== '#ffffff')
								? 'rgba(255,255,255,0.35)'
								: 'rgba(0,0,0,0.35)'}"
						>
							<div
								class="text-2xl leading-tight"
								style="color:{getSecondaryColor(infoCommon.nbaAbbreviation).hex === '#ffffff'
									? '#ffffff'
									: '#000000'}"
							>
								{infoCommon.name}
							</div>
							<div
								class="text-normal cursor-pointer"
								style="color:{getSecondaryColor(infoCommon.nbaAbbreviation).hex === '#ffffff'
									? '#ffffff'
									: '#000000'}"
							>
								<span>
									{seasons.reduce((prev, curr) => {
										return prev.season < curr.season ? prev : curr;
									}).season - 1} - {seasons.reduce((prev, curr) => {
										return prev.season > curr.season ? prev : curr;
									}).season}
								</span>
							</div>
						</div>
					</div>
				</div>
			</a>
		</div>
	{/each}
</div>
