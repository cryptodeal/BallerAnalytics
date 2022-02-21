<script>
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import Color from 'color';
	import Grid from '$lib/ux/teams/genBg/Grid.svelte';
	import { interpolateLab as interpolate } from 'd3-interpolate';
	import { genPalette, getBackgroundColors } from '$lib/ux/teams/genBg/core/colors';
	import { teams } from '$lib/ux/teams/genBg/core/teams';
	import { tweened } from 'svelte/motion';
	import darkMode from '$lib/data/stores/theme';

	let selectedTeam = teams[3],
		letters,
		teamPrimary,
		teamSecondary,
		colorPalette = [],
		bgInner = tweened(darkMode ? '#000' : '#fff', { duration: 500, interpolate }),
		bgOuter = tweened(darkMode ? '#000' : '#fff', { duration: 500, interpolate });

	$: if (selectedTeam) {
		letters = selectedTeam.simpleName.toUpperCase().split('');
		teamPrimary = getMainColor(selectedTeam.abbreviation).hex;
		teamSecondary = getSecondaryColor(selectedTeam.abbreviation).hex;
		colorPalette = genPalette(Color(teamPrimary), Color(teamSecondary), 5);
		const background = getBackgroundColors(colorPalette);
		$bgInner = background.bgInner;
		$bgOuter = background.bgOuter;
	}
</script>

<div class="svgBgContainer" style:--bg-inner={$bgInner} style:--bg-outer={$bgOuter}>
	<div class="svgBgGrid">
		<Grid {colorPalette} {letters} />
	</div>
</div>

<style>
	.svgBgContainer {
		height: 100vh;
		min-width: 100vw;
		overflow: hidden;
		background-image: radial-gradient(var(--bg-inner) 0%, var(--bg-outer) 100%);
	}

	.svgBgGrid {
		display: flex;
		height: 100%;
		overflow: hidden;
		min-width: 100%;
	}

	.svgBgGrid > :global(*) {
		/* transition enforcement */
		grid-column: 1/2;
		grid-row: 2/3;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
