<script lang="ts">
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import type { ITeamBgInfo } from '$lib/ux/teams/genBg/core/types';
	import Color from 'color';
	import Grid from '$lib/ux/teams/genBg/Grid.svelte';
	import { interpolateLab as interpolate } from '$lib/ux/teams/genBg/core/utils';
	import { genPalette } from '$lib/ux/teams/genBg/core/colors';
	import { getBackgroundColors } from '$lib/ux/teams/genBg/core/colors';
	import { tweened } from 'svelte/motion';
	import { teams } from '$lib/ux/teams/genBg/core/teams';
	export let selectedTeam: string;
	let letters,
		teamPrimary: string,
		teamSecondary: string,
		colorPalette: string[] = [],
		bgInner = tweened('#fff', { duration: 500, interpolate }),
		bgOuter = tweened('#fff', { duration: 500, interpolate }),
		selectedTeamInfo: ITeamBgInfo;

	$: if (selectedTeam) {
		const teamIndex = teams.findIndex((t) => t.simpleName.toLowerCase() === selectedTeam);
		if (teamIndex > -1) {
			selectedTeamInfo = teams[teamIndex];
			letters = selectedTeamInfo.simpleName.toUpperCase().split('');
			teamPrimary = getMainColor(selectedTeamInfo.abbreviation).hex;
			teamSecondary = getSecondaryColor(selectedTeamInfo.abbreviation).hex;
			colorPalette = genPalette(Color(teamPrimary), Color(teamSecondary), 5);
			const background = getBackgroundColors(colorPalette);
			$bgInner = background.bgInner;
			$bgOuter = background.bgOuter;
		}
	}
</script>

<div class="container" style:--bg-inner={$bgInner} style:--bg-outer={$bgOuter}>
	<div class="grid">
		<Grid {colorPalette} {letters} />
	</div>
	<div class="w-100vw">
		<slot />
	</div>
</div>

<style>
	.container {
		background-image: radial-gradient(var(--bg-inner) 0%, var(--bg-outer) 100%);
		min-width: 100vw;
		height: 100%;
		overflow: auto;
	}

	.grid {
		position: relative;
	}
</style>
