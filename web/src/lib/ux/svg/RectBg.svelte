<script lang="ts">
	import { rand } from './core/utils';
	import Color from 'color';
	import { interpolateLab as interpolate } from '$lib/ux/teams/genBg/core/utils';
	import { genPalette, getBackgroundColors } from '$lib/ux/teams/genBg/core/colors';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import { tweened } from 'svelte/motion';
	import darkMode from '$lib/data/stores/theme';
	import type { Team2Document } from '@balleranalytics/nba-api-ts';
	export let selectedTeam: Team2Document;

	let w: number,
		h: number,
		teamPrimary: string,
		teamSecondary: string,
		rectCount: number,
		colorPalette: string[] = [],
		bgInner = tweened(darkMode ? '#000' : '#fff', { duration: 250, interpolate }),
		bgOuter = tweened(darkMode ? '#000' : '#fff', { duration: 250, interpolate });

	$: if (selectedTeam && w & h) rectCount = Math.round((w * h) / 1000);

	$: if (selectedTeam) {
		teamPrimary = getMainColor(selectedTeam.infoCommon.nbaAbbreviation).hex;
		teamSecondary = getSecondaryColor(selectedTeam.infoCommon.nbaAbbreviation).hex;
		colorPalette = genPalette(Color(teamPrimary), Color(teamSecondary), 10);
		const background = getBackgroundColors(colorPalette);
		$bgInner = background.bgInner;
		$bgOuter = background.bgOuter;
	}
</script>

{#if selectedTeam}
	<div
		class="container"
		class:opaqueGradient={$darkMode}
		bind:offsetWidth={w}
		bind:offsetHeight={h}
		style:--bg-inner={$bgInner}
		style:--bg-outer={$bgOuter}
	>
		<svg class="w-full h-full">
			{#if w && h && colorPalette.length && rectCount}
				{#each new Array(rectCount) as { }, i}
					<rect
						x={rand(w + 50) - 50}
						y={rand(h + 50) - 50}
						width={rand(200) + 20}
						height={rand(200) + 20}
						opacity="0.{i % 3 === 0 ? '6' : '8'}{rand(10)}"
						fill={colorPalette[rand(colorPalette.length - 1)]}
					/>
				{/each}
			{/if}
		</svg>
	</div>
{/if}

<style>
	.container {
		background-image: radial-gradient(var(--bg-inner) 0%, var(--bg-outer) 100%);
		min-width: 100vw;
		height: 100vh;
		position: fixed;
		z-index: -10;
	}

	.opaqueGradient {
		opacity: 0.6;
	}
</style>
