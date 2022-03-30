<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { SeasonList } from '$lib/types';
	import type { TeamSlugParams } from './types';
	import type { TeamPageInitData } from '$lib/data/_db/controllers/team';
	import type { get } from './index.json';

	export const logoModules = import.meta.globEager('../../../lib/ux/teams/assets/logo-*.svelte');

	type TeamPageLoadProps = TeamPageInitData & {
		seasonIdx: number;
		seasons: SeasonList[];
		seasonYear: number;
	};

	type InputProps = NonNullable<Awaited<ReturnType<typeof get>>['body']>;

	type OutputProps = TeamPageLoadProps & InputProps;

	export const load: Load<TeamSlugParams, InputProps, OutputProps> = async ({
		fetch,
		params,
		url
	}) => {
		if (url.searchParams.get('seasonIdx')) {
			const apiUrl = `/teams/${params.teamSlug}.json?seasonIdx=${url.searchParams.get(
				'seasonIdx'
			)}`;
			const res = await fetch(apiUrl);
			if (res.ok) {
				const { team, players, games } = (await res.json()) as TeamPageInitData;
				const seasonIdx = parseInt(url.searchParams.get('seasonIdx'));
				const seasons: SeasonList[] = [];
				team.seasons.map((s) => {
					const { season } = s;
					seasons.push({ season });
				});
				seasons.sort((a, b) => a.season - b.season);
				return {
					props: {
						team,
						players,
						games,
						seasonIdx,
						seasonYear: team.seasons[seasonIdx].season,
						seasons
					}
				};
			}
			return {
				status: res.status,
				error: new Error(`Could not load ${apiUrl}`)
			};
		} else {
			const apiUrl = `/teams/${params.teamSlug}.json`;
			const res = await fetch(apiUrl);
			if (res.ok) {
				const { team, players, games } = (await res.json()) as TeamPageInitData;
				const seasonIdx = 0;
				const seasons: SeasonList[] = [];
				team.seasons.map((s) => {
					const { season } = s;
					seasons.push({ season });
				});
				seasons.sort((a, b) => a.season - b.season);
				return {
					props: {
						team,
						players,
						games,
						seasonIdx,
						seasonYear: team.seasons[seasonIdx].season,
						seasons
					}
				};
			}
			return {
				status: res.status,
				error: new Error(`Could not load ${apiUrl}`)
			};
		}
	};
</script>

<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ScheduleTable from '$lib/ux/tables/teams/Schedule.svelte';
	import PlayerRoster from '$lib/ux/tables/teams/PlayerRoster.svelte';
	import { getMainColor, getSecondaryColor } from 'nba-color';
	import RectBg from '$lib/ux/svg/RectBg.svelte';
	import TeamLogo from '$lib/ux/teams/assets/AnyTeamLogo.svelte';
	import Table from '$lib/ux/tables/core/Table.svelte';
	import THead from '$lib/ux/tables/core/THead.svelte';
	import type {
		Game2Document,
		Team2Document,
		PopulatedDocument,
		Player2StatsObject
	} from '@balleranalytics/nba-api-ts';
	import type { TeamColor } from '$lib/types';
	import TabPanel from '$lib/ux/tabs/TabPanel.svelte';
	import TabList from '$lib/ux/tabs/TabList.svelte';
	import Tabs from '$lib/ux/tabs/Tabs.svelte';
	import Color from 'color';
	import { tweened } from 'svelte/motion';
	import { interpolateLab as interpolate } from 'd3-interpolate';
	import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/env';
	import { genPalette, getBackgroundColors } from '$lib/ux/svg/core/colors';
	import type { IColHeader } from '$lib/ux/tables/types';
	export let team: PopulatedDocument<
		PopulatedDocument<Team2Document, `seasons.regularSeason.games`>,
		'seasons.roster.players.player'
	>;
	export let games: PopulatedDocument<
		PopulatedDocument<
			PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
			'home.players.player'
		>,
		'visitor.players.player'
	>[];
	export let players: Player2StatsObject[];
	export let seasonIdx: number;
	export let seasonYear: number;
	export let seasons: SeasonList[];

	const colHeaders: IColHeader[] = [
		{ title: 'Date/Time (ET)' },
		{ title: 'Opponent' },
		{ title: 'Result' },
		{ title: 'W - L' }
	];
	let bgInner = tweened(darkMode ? '#000' : '#fff', { duration: 200, interpolate }),
		bgOuter = tweened(darkMode ? '#000' : '#fff', { duration: 200, interpolate });
	const { hex: primaryColor, rgb: color1 } = getMainColor(
		team.infoCommon.nbaAbbreviation
	) as unknown as TeamColor;
	const { hex: secondaryColor, rgb: color2 } = getSecondaryColor(
		team.infoCommon.nbaAbbreviation
	) as unknown as TeamColor;
	const colorPalette = genPalette(Color(primaryColor), Color(secondaryColor), 5);
	if (browser) {
		const background = getBackgroundColors(colorPalette);
		$bgInner = background.bgInner;
		$bgOuter = background.bgOuter;
	}

	async function loadRosterData() {
		const seasonIndex = team.seasons.findIndex((s) => s.season === seasonYear);
		const res = await fetch(`/teams/${team.infoCommon.slug}.json?seasonIdx=${seasonIndex}`);
		const {
			team: teamData,
			players: playerData,
			games: gameData
		}: TeamPageInitData = await res.json();
		team = teamData;
		players = playerData;
		games = gameData;
		seasonIdx = seasonIndex;
	}
</script>

<MetaTags
	title="{seasonYear} {team.infoCommon.name} Season Basic Info"
	description="Team Schedule, Roster, and Statistics for the {team.infoCommon
		.name}'s {seasonYear} season."
/>

<RectBg selectedTeam={team} />

<div class="appContent">
	<div class="p-2">
		<div
			class="glassmorphicCard mx-auto flex flex-wrap gap-6 py-6 justify-center mb-6 items-center px-2 md:(container mx-auto)"
		>
			<div
				class="h-50 w-50 rounded-lg dark:(bg-white backdrop-filter backdrop-blur-sm bg-opacity-10)"
			>
				<TeamLogo size={200} {logoModules} slug={team.infoCommon.slug} />
			</div>
			<h1 class="text-dark-600 dark:text-light-200">
				{team.infoCommon.name}
			</h1>
		</div>
		<div class="p-2 md:(container mx-auto)">
			<div class="glassmorphicCard flex inline-flex items-center px-4 py-2 text-black mb-6">
				<label class="text-dark-600 dark:text-light-200 text-lg mr-4" for="season-select"
					>Season:</label
				>

				<select type="select" id="season-select" bind:value={seasonYear} on:change={loadRosterData}>
					{#each seasons as { season }}
						<option value={season}>{season}</option>
					{/each}
				</select>
			</div>
			<Tabs>
				<div class="w-full glassmorphicCard mx-1 px-2 py-1 md:w-auto">
					<TabList
						primaryColor={color1}
						secondaryColor={color2}
						links={[{ title: 'Schedule' }, { title: 'Roster' }, { title: 'Stats' }]}
					/>
				</div>

				<!-- Schedule Data Tab -->
				<TabPanel>
					{#if team.seasons[seasonIdx].regularSeason.games.length > 0}
						<div class="glassmorphicCard px-4 py-2 my-5">
							<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">
								{team.seasons[seasonIdx].season} Regular Season:
							</h2>
						</div>
						<div class="my-4">
							<ScheduleTable {logoModules} schedule={games} teamId={team._id} />
						</div>
					{:else}
						<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">
							No games played in {team.seasons[seasonIdx].season}
						</h2>
					{/if}
					<!--
            {#if team.seasons[seasonIdx].postseason.games.length > 0}
						<div class="glassmorphicCard px-4 py-2 my-5">
							<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">
								{team.seasons[seasonIdx].season} Postseason:
							</h2>
						</div>
						<div class="my-4">
							<ScheduleTable
								{logoModules}
								schedule={games}
								teamId={team._id}
							/>
						</div>
					{/if}
          -->
				</TabPanel>

				<!-- Roster Data Tab -->
				<TabPanel>
					<div class="glassmorphicCard px-4 py-2 my-5">
						<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">Roster:</h2>
					</div>
					<PlayerRoster roster={team.seasons[seasonIdx].roster.players} season={seasonYear} />
				</TabPanel>

				<!-- Stats Data Tab -->
				<TabPanel>
					<div class="glassmorphicCard px-4 py-2 my-5">
						<h2 class="tabPanelTitle text-dark-600 dark:text-light-200">Stats:</h2>
					</div>
					<Table>
						<THead slot="thead" {colHeaders} />
					</Table>
				</TabPanel>
			</Tabs>
		</div>
	</div>
</div>

<style>
	.tabPanelTitle {
		@apply text-center m-4;
	}
</style>
