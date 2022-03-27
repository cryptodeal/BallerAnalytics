<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { getAge } from '$lib/functions/helpers';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import { resolve } from '$lib/functions/helpers';
	import type { PlayerRosterStatItem } from './types';
	import type { IColHeader, ISortBy } from '../types';
	export let roster: PlayerRosterStatItem[], season: number;

	let sortBy: ISortBy = { col: 'player.name.full', ascending: true };

	$: if (season) sortBy = { col: 'player.name.full', ascending: true };

	const colHeaders: IColHeader[] = [
		{ title: 'Name', subtext: '* denotes player on 2-Way contract', key: 'player.name.full' },
		{ title: 'Age', key: 'player.birthDate' },
		{ title: 'G', key: 'player.stats.games' },
		{ title: 'GS', key: 'player.stats.gamesStarted' },
		{ title: 'Min', key: 'stats.stats.minutes' },
		{ title: 'FG', key: 'player.stats.fieldGoalsMade' },
		{ title: 'FGA', key: 'player.stats.fieldGoalsAttempted' },
		{ title: 'FG%', key: 'player.stats.fieldGoalsPct' },
		{ title: '3P', key: 'player.stats.threePointersMade' },
		{ title: '3PA', key: 'player.stats.threePointersAttempted' },
		{ title: '3P%', key: 'player.stats.threePointersPct' },
		{ title: '2P', key: 'player.stats.twoPointFGMade' },
		{ title: '2PA', key: 'player.stats.twoPointFGAttempted' },
		{ title: '2P%', key: 'player.stats.twoPointFGPct' },
		{ title: 'eFG%', key: 'player.stats.effectiveFieldGoalPct' },
		{ title: 'FT', key: 'player.stats.freeThrowsAttempted' },
		{ title: 'FTA', key: 'player.stats.freeThrowsMade' },
		{ title: 'FT%', key: 'player.stats.freeThrowsPct' },
		{ title: 'ORB', key: 'player.stats.offReb' },
		{ title: 'DRB', key: 'player.stats.defReb' },
		{ title: 'TRB', key: 'player.stats.totalReb' },
		{ title: 'AST', key: 'player.stats.assists' },
		{ title: 'STL', key: 'player.stats.steals' },
		{ title: 'BLK', key: 'player.stats.blocks' },
		{ title: 'TOV', key: 'player.stats.turnovers' },
		{ title: 'PF', key: 'player.stats.personalFouls' },
		{ title: 'PTS', key: 'player.stats.points' }
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
				return 1 * sortModifier;
			} else {
				return -1 * sortModifier;
			}
		};
		roster = roster.sort(sort);
	};
</script>

<Table>
	<THead slot="thead" {colHeaders} {sort} {sortBy} />
	<svelte:fragment slot="tbody">
		{#each roster as { player, twoWay }, i}
			<tr>
				<!-- Display Player Name -->
				<td
					class="w-full py-2 px-4 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 xl:px-6"
				>
					<div class="flex w-full inline-flex items-center">
						<div class="flex-shrink-0 w-30 h-20">
							<Headshot
								avif={player.meta.images.headshot.avif}
								png={player.meta.images.headshot.png}
								webp={player.meta.images.headshot.webp}
								alt="{player.name.full} headshot"
							/>
						</div>

						<div class="ml-2 w-auto">
							<div class="text-sm font-medium leading-5 text-gray-900 dark:text-light-200">
								{#if player}
									{player.name.full}
									{#if twoWay}
										<span class="text-xs">*</span>
									{/if}
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
						{#if player}
							{getAge(new Date(player.birthDate).toString())}
						{/if}
					</div>
				</td>

				<!-- Display Player Games Played -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.games}
							{player.stats.games}
						{/if}
					</div>
				</td>

				<!-- Display Player Games Started -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.gamesStarted}
							{player.stats.gamesStarted}
						{/if}
					</div>
				</td>

				<!-- Display Player Minutes -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.minutes}
							{player.stats.minutes}
						{/if}
					</div>
				</td>

				<!-- Display Player fieldGoalsMade -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.fieldGoalsMade}
							{player.stats.fieldGoalsMade}
						{/if}
					</div>
				</td>

				<!-- Display Player fieldGoalsAttempted -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.fieldGoalsAttempted}
							{player.stats.fieldGoalsAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player fieldGoalsPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.fieldGoalsPct}
							{player.stats.fieldGoalsPct}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersMade -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.threePointersMade}
							{player.stats.threePointersMade}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersAttempted -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.threePointersAttempted}
							{player.stats.threePointersAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.threePointersPct}
							{player.stats.threePointersPct}
						{/if}
					</div>
				</td>

				<!-- Display Player twoPointFGMade -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.twoPointFGMade}
							{player.stats.twoPointFGMade}
						{/if}
					</div>
				</td>

				<!-- Display Player twoPointFGAttempted -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.twoPointFGAttempted}
							{player.stats.twoPointFGAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player twoPointFGPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.twoPointFGPct}
							{player.stats.twoPointFGPct}
						{/if}
					</div>
				</td>

				<!-- Display Player effectiveFieldGoalPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.effectiveFieldGoalPct}
							{player.stats.effectiveFieldGoalPct}
						{/if}
					</div>
				</td>

				<!-- Display Player freeThrowsAttempted -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.freeThrowsAttempted}
							{player.stats.freeThrowsAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player freeThrowsMade -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.freeThrowsMade}
							{player.stats.freeThrowsMade}
						{/if}
					</div>
				</td>

				<!-- Display Player freeThrowsPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.freeThrowsPct}
							{player.stats.freeThrowsPct}
						{/if}
					</div>
				</td>

				<!-- Display Player offReb -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.offReb}
							{player.stats.offReb}
						{/if}
					</div>
				</td>

				<!-- Display Player defReb -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.defReb}
							{player.stats.defReb}
						{/if}
					</div>
				</td>

				<!-- Display Player totalReb -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.totalReb}
							{player.stats.totalReb}
						{/if}
					</div>
				</td>

				<!-- Display Player assists -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.assists}
							{player.stats.assists}
						{/if}
					</div>
				</td>

				<!-- Display Player steals -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.steals}
							{player.stats.steals}
						{/if}
					</div>
				</td>

				<!-- Display Player blocks -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.blocks}
							{player.stats.blocks}
						{/if}
					</div>
				</td>

				<!-- Display Player turnovers -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.turnovers}
							{player.stats.turnovers}
						{/if}
					</div>
				</td>

				<!-- Display Player personalFouls -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.personalFouls}
							{player.stats.personalFouls}
						{/if}
					</div>
				</td>

				<!-- Display Player points -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.stats.points}
							{player.stats.points}
						{/if}
					</div>
				</td>
			</tr>
		{/each}
	</svelte:fragment>
</Table>
