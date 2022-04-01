<script lang="ts">
	import { getAge } from '$lib/functions/helpers';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import type { Player2Document, PopulatedDocument } from '@balleranalytics/nba-api-ts';
	import type { IColHeader } from '../types';
	import dayjs from 'dayjs';
	export let player: PopulatedDocument<Player2Document, 'seasons.teams.id'>;

	const colHeaders: IColHeader[] = [
		{ title: 'Name', subtext: '* denotes player on 2-Way contract', key: 'name.full' },
		{ title: 'Age', key: 'birthDate' },
		{ title: 'Teams', key: 'seasons.teams' },
		{ title: 'G', key: 'stats.0.totals.games' },
		{ title: 'GS', key: 'stats.0.totals.gamesStarted' },
		{ title: 'Min', key: 'stats.0.totals.minutes' },
		{ title: 'FG', key: 'stats.0.totals.fieldGoalsMade' },
		{ title: 'FGA', key: 'stats.0.totals.fieldGoalsAttempted' },
		{ title: 'FG%', key: 'stats.0.totals.fieldGoalsPct' },
		{ title: '3P', key: 'stats.0.totals.threePointersMade' },
		{ title: '3PA', key: 'stats.0.totals.threePointersAttempted' },
		{ title: '3P%', key: 'stats.0.totals.threePointersPct' },
		{ title: '2P', key: 'stats.0.totals.twoPointFGMade' },
		{ title: '2PA', key: 'stats.0.totals.twoPointFGAttempted' },
		{ title: '2P%', key: 'stats.0.totals.twoPointFGPct' },
		{ title: 'eFG%', key: 'stats.0.totals.effectiveFieldGoalPct' },
		{ title: 'FT', key: 'stats.0.totals.freeThrowsAttempted' },
		{ title: 'FTA', key: 'stats.0.totals.freeThrowsMade' },
		{ title: 'FT%', key: 'stats.0.totals.freeThrowsPct' },
		{ title: 'ORB', key: 'stats.0.totals.offReb' },
		{ title: 'DRB', key: 'stats.0.totals.defReb' },
		{ title: 'TRB', key: 'stats.0.totals.totalReb' },
		{ title: 'AST', key: 'stats.0.totals.assists' },
		{ title: 'STL', key: 'stats.0.totals.steals' },
		{ title: 'BLK', key: 'stats.0.totals.blocks' },
		{ title: 'TOV', key: 'stats.0.totals.turnovers' },
		{ title: 'PF', key: 'stats.0.totals.personalFouls' },
		{ title: 'PTS', key: 'stats.0.totals.points' }
	];
</script>

<Table>
	<THead slot="thead" {colHeaders} />
	<svelte:fragment slot="tbody">
		{#each player.seasons as { year, teams, regularSeason: { stats: { totals: { games, gamesStarted, minutes, fieldGoalsMade, fieldGoalsAttempted, fieldGoalsPct, threePointersMade, threePointersAttempted, threePointersPct, twoPointFGMade, twoPointFGAttempted, twoPointFGPct, effectiveFieldGoalPct, freeThrowsMade, freeThrowsAttempted, freeThrowsPct, offReb, defReb, totalReb, assists, steals, blocks, turnovers, personalFouls, points }, teamSplits } } }, i}
			{@const birthDate = new Date(player.birthDate)}
			{@const sznBday = dayjs(birthDate).year(year).toDate()}
			{@const age = getAge(birthDate.toString(), sznBday)}
			<tr>
				<!-- Display Season Year -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if year}
							{year - 1}-{year.toString().slice(-2)}
						{/if}
					</div>
				</td>

				<!-- Display Player Age -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if age}
							{age}
						{/if}
					</div>
				</td>

				<!-- Display Player Team/Totals (if teamSplit) -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if teamSplits.length}
							TOT
						{:else}
							{teams[0].id.infoCommon.nbaAbbreviation}
						{/if}
						{#if age}
							{age}
						{/if}
					</div>
				</td>

				<!-- Display Player Games Played -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if games}
							{games}
						{/if}
					</div>
				</td>

				<!-- Display Player Games Started -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if gamesStarted}
							{gamesStarted}
						{/if}
					</div>
				</td>

				<!-- Display Player Minutes -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if minutes}
							{minutes}
						{/if}
					</div>
				</td>

				<!-- Display Player fieldGoalsMade -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if fieldGoalsMade}
							{fieldGoalsMade}
						{/if}
					</div>
				</td>

				<!-- Display Player fieldGoalsAttempted -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if fieldGoalsAttempted}
							{fieldGoalsAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player fieldGoalsPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if fieldGoalsPct}
							{fieldGoalsPct}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersMade -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if threePointersMade}
							{threePointersMade}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersAttempted -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if threePointersAttempted}
							{threePointersAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if threePointersPct}
							{threePointersPct}
						{/if}
					</div>
				</td>

				<!-- Display Player twoPointFGMade -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if twoPointFGMade}
							{twoPointFGMade}
						{/if}
					</div>
				</td>

				<!-- Display Player twoPointFGAttempted -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if twoPointFGAttempted}
							{twoPointFGAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player twoPointFGPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if twoPointFGPct}
							{twoPointFGPct}
						{/if}
					</div>
				</td>
				<!-- Display Player effectiveFieldGoalPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if effectiveFieldGoalPct}
							{effectiveFieldGoalPct}
						{/if}
					</div>
				</td>
				<!-- Display Player freeThrowsMade -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if freeThrowsMade}
							{freeThrowsMade}
						{/if}
					</div>
				</td>
				<!-- Display Player freeThrowsAttempted -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if freeThrowsAttempted}
							{freeThrowsAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player freeThrowsPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if freeThrowsPct}
							{freeThrowsPct}
						{/if}
					</div>
				</td>

				<!-- Display Player offReb -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if offReb}
							{offReb}
						{/if}
					</div>
				</td>

				<!-- Display Player defReb -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if defReb}
							{defReb}
						{/if}
					</div>
				</td>

				<!-- Display Player totalReb -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if totalReb}
							{totalReb}
						{/if}
					</div>
				</td>

				<!-- Display Player assists -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if assists}
							{assists}
						{/if}
					</div>
				</td>

				<!-- Display Player steals -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if steals}
							{steals}
						{/if}
					</div>
				</td>

				<!-- Display Player blocks -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if blocks}
							{blocks}
						{/if}
					</div>
				</td>

				<!-- Display Player turnovers -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if turnovers}
							{turnovers}
						{/if}
					</div>
				</td>

				<!-- Display Player personalFouls -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if personalFouls}
							{personalFouls}
						{/if}
					</div>
				</td>

				<!-- Display Player points -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if points}
							{points}
						{/if}
					</div>
				</td>
			</tr>
		{/each}
	</svelte:fragment>
</Table>
