<script lang="ts">
	import tinycolor from 'tinycolor2';
	import { MetaTags } from 'svelte-meta-tags';
	import { invertColor } from '$lib/functions/helpers';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import type { PageData } from './$types';
	export let data: PageData;
	let { teams } = data;
	$: ({ teams } = data); // so it stays in sync when `data` changes
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

{#each teams as { infoCommon, seasons }}
	{@const mainColor = getMainColor(infoCommon.nbaAbbreviation || infoCommon.abbreviation).hex}
	{@const secondaryColor = getSecondaryColor(
		infoCommon.nbaAbbreviation || infoCommon.abbreviation
	).hex}
	{@const invertedColor = invertColor(mainColor, true)}
	{@const backdropBg = tinycolor(invertedColor).setAlpha(0.4).toRgbString()}
	<div class="container mx-auto my-4">
		<a class="w-full" data-sveltekit-prefetch href="teams/{infoCommon.slug}">
			<div
				style:--teamBg={mainColor}
				style:--teamBorder={secondaryColor}
				class="teamItem rounded-lg shadow-lg border-2 w-full flex flex-col md:flex md:flex-row gap-y-4 p-3"
			>
				<div style:--logoBg={backdropBg} class="logoBackdrop rounded-lg mx-auto w-48 h-48">
					<img
						class="h-48 w-48"
						src="assets/teams/logo-{infoCommon.slug}.svg"
						alt="{infoCommon.name}'s' logo"
					/>
				</div>
				<div class="md:w-7/8 md:justify-end w-full mx-auto px-3 inline-flex h-auto justify-center">
					<div
						style:--backdropBg={backdropBg}
						style:--fontColor={backdropBg !== 'rgba(255, 255, 255, 0.4)' ? '#ffffff' : '#000000'}
						class="teamInfo rounded-lg my-auto p-2 text-center font-semibold pt-3 md:text-right"
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

<style lang="postcss">
	.logoBackdrop {
		background-color: var(--logoBg);
	}

	.teamItem {
		background-color: var(--teamBg);
		border-color: var(--teamBorder);
	}

	.teamInfo {
		background-color: var(--backdropBg);
		color: var(--fontColor);
	}

	@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
		.teamInfo {
			background-color: var(--backdropBg);
			color: var(--fontColor);
			@apply backdrop-filter backdrop-blur-md;
		}

		.logoBackdrop {
			background-color: var(--logoBg);
			@apply backdrop-filter backdrop-blur-md;
		}
	}
</style>
