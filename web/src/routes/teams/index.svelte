<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Team2Object } from '@balleranalytics/nba-api-ts';
	export const logoModules = import.meta.globEager('../../lib/ux/teams/assets/logo-*.svelte');
	export const load: Load = async ({ fetch }) => {
		const url = `/teams.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { teams }: { teams: Team2Object[] } = await res.json();
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
	import TeamLogo from '$lib/ux/teams/assets/AnyTeamLogo.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	export let teams: Team2Object[];
</script>

<MetaTags
	title="NBA {Math.max.apply(
		Math,
		teams[0].seasons.map(function (o) {
			return o.season;
		})
	) - 1}-{`${Math.max.apply(
		Math,
		teams[0].seasons.map(function (o) {
			return o.season;
		})
	)}`.substring(-2)} Teams"
	description="Index of teams from the {Math.max.apply(
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

<div class="appContent flex">
	<div class="flex-grow mb-10">
		{#each teams as { infoCommon, seasons }}
			<div class="container mx-auto my-4">
				<a sveltekit:prefetch href="teams/{infoCommon.slug}">
					<div
						style:--teamBg={getMainColor(infoCommon.nbaAbbreviation).hex}
						style:--teamBorder={getSecondaryColor(infoCommon.nbaAbbreviation).hex}
						class="teamItem rounded-lg shadow-lg border-2 w-full flex flex-wrap gap-y-4 p-3 md:(flex-row)"
					>
						<div
							class="rounded-lg bg-white backdrop-filter backdrop-blur-lg bg-opacity-35 mx-auto w-1/2 px-2 md:w-1/8"
						>
							<TeamLogo {logoModules} slug={infoCommon.slug} />
						</div>
						<div
							class="md:(w-7/8 justify-end) w-full mx-auto px-3 flex inline-flex h-auto justify-center"
						>
							<div
								style:--backdropBg={getSecondaryColor(infoCommon.nbaAbbreviation).hex ===
									'#000000' ||
								(getSecondaryColor(infoCommon.nbaAbbreviation).hex !== '#000000' &&
									getSecondaryColor(infoCommon.nbaAbbreviation).hex !== '#ffffff')
									? 'rgba(255,255,255,0.35)'
									: 'rgba(0,0,0,0.35)'}
								style:--fontColor={getSecondaryColor(infoCommon.nbaAbbreviation).hex === '#ffffff'
									? '#ffffff'
									: '#000000'}
								class="teamInfo rounded-lg teamItem backdrop-blur-xl backdrop-filter bg-opacity-40 my-auto p-2 text-center font-semibold pt-3 md:text-right"
							>
								<div class="text-2xl leading-tight">
									{infoCommon.name}
								</div>
								<div class="text-normal cursor-pointer">
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
</div>

<style>
	.teamItem {
		background-color: var(--teamBg);
		border-color: var(--teamBorder);
	}

	.teamInfo {
		background-color: var(--backdropBg);
		color: var(--fontColor);
	}
</style>
