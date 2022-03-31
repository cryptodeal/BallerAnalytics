<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { formatPct, getAge } from '$lib/functions/helpers';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import { resolve } from '$lib/functions/helpers';
	import type { Player2StatsObject } from '@balleranalytics/nba-api-ts';
	import type { IColHeader, ISortBy } from '../types';
	export let roster: Player2StatsObject[], season: number;

	let sortBy: ISortBy = { col: 'name.full', ascending: true };

	$: if (season) sortBy = { col: 'name.full', ascending: true };

	const colHeaders: IColHeader[] = [
		{ title: 'Name', subtext: '* denotes player on 2-Way contract', key: 'name.full' },
		{ title: 'Age', key: 'birthDate' },
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

	$: sort = (column: string) => {
		if (sortBy.col == column) {
			sortBy.ascending = !sortBy.ascending;
		} else {
			sortBy.col = column;
			sortBy.ascending = true;
		}
		// Modifier to sorting function for ascending or descending
		let sortModifier = sortBy.ascending ? 1 : -1;
		let sort = (a, b) => {
			let itemA = resolve(column, a);
			let itemB = resolve(column, b);
			if (itemA && itemB) {
				return itemA < itemB ? -1 * sortModifier : itemA > itemB ? 1 * sortModifier : 0;
			} else if (!itemA && itemB) {
				return -1 * sortModifier;
			} else if (itemA && !itemB) {
				return 1 * sortModifier;
			} else {
				return 0;
			}
		};
		roster = roster.sort(sort);
	};
</script>

<Table>
	<THead slot="thead" {colHeaders} {sort} {sortBy} />
	<svelte:fragment slot="tbody">
		{#each roster as { birthDate, meta, stats: [{ totals: { games, gamesStarted, minutes, fieldGoalsMade, fieldGoalsAttempted, fieldGoalsPct, threePointersMade, threePointersAttempted, threePointersPct, twoPointFGMade, twoPointFGAttempted, twoPointFGPct, effectiveFieldGoalPct, freeThrowsMade, freeThrowsAttempted, freeThrowsPct, offReb, defReb, totalReb, assists, steals, blocks, turnovers, personalFouls, points }, twoWay }], name }, i}
			<tr>
				<!-- Display Player Name -->
				<td
					class="w-full py-2 px-4 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 xl:px-6"
				>
					<div class="flex w-full inline-flex items-center">
						<div class="flex-shrink-0 w-30 h-20">
							<Headshot
								avif={meta.images.headshot.avif}
								png={meta.images.headshot.png}
								webp={meta.images.headshot.webp}
								alt="{name.full} headshot"
							/>
						</div>

						<div class="ml-2 w-auto">
							<div class="text-sm font-medium leading-5 text-gray-900 dark:text-light-200">
								{name.full}
								{#if twoWay}
									<span class="text-xs">*</span>
								{/if}
							</div>
						</div>
					</div>
				</td>

				<!-- Display Player Age -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if birthDate}
							{getAge(new Date(birthDate).toString())}
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
						{:else}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
						{/if}
					</div>
				</td>

				<!-- Display Player fieldGoalsPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if fieldGoalsPct}
							{formatPct(fieldGoalsPct)}
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if threePointersPct}
							{formatPct(threePointersPct)}
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
						{/if}
					</div>
				</td>

				<!-- Display Player twoPointFGPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if twoPointFGPct}
							{formatPct(twoPointFGPct)}
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
						{/if}
					</div>
				</td>

				<!-- Display Player freeThrowsPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if freeThrowsPct}
							{formatPct(freeThrowsPct)}
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
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
						{:else if games && games > 0}
							0
						{/if}
					</div>
				</td>
			</tr>
		{/each}
	</svelte:fragment>
</Table>
