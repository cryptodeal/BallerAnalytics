<script lang="ts">
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { resolve, formatPct } from '$lib/functions/helpers';

	import type { IColHeader, ISortBy } from '../types';
	import type { BoxScoreData } from '$lib/types';

	export let boxscore: BoxScoreData, isHome: boolean;
	$: basePath = isHome ? 'home.players' : 'visitor.players';
	let data;

	$: if (basePath) data = resolve(basePath, boxscore);

	let sortBy: ISortBy = { col: 'stats.totals.points', ascending: false };
	$: if (boxscore) sortBy = { col: 'stats.totals.points', ascending: false };

	const colHeaders: IColHeader[] = [
		{ title: 'Name', key: 'player.name.full' },
		{ title: 'Min', key: 'stats.totals.minutes' },
		{ title: 'FG', key: 'stats.totals.fieldGoalsMade' },
		{ title: 'FGA', key: 'stats.totals.fieldGoalsAttempted' },
		{ title: 'FG%', key: 'stats.totals.fieldGoalsPct' },
		{ title: '3P', key: 'stats.totals.threePointersMade' },
		{ title: '3PA', key: 'stats.totals.threePointersAttempted' },
		{ title: '3P%', key: 'stats.totals.threePointersPct' },
		{ title: 'FT', key: 'stats.totals.freeThrowsMade' },
		{ title: 'FTA', key: 'stats.totals.freeThrowsAttempted' },
		{ title: 'FT%', key: 'stats.totals.freeThrowsPct' },
		{ title: 'ORB', key: 'stats.totals.offReb' },
		{ title: 'DRB', key: 'stats.totals.defReb' },
		{ title: 'TRB', key: 'stats.totals.totalReb' },
		{ title: 'AST', key: 'stats.totals.assists' },
		{ title: 'STL', key: 'stats.totals.steals' },
		{ title: 'BLK', key: 'stats.totals.blocks' },
		{ title: 'PF', key: 'stats.totals.personalFouls' },
		{ title: 'PTS', key: 'stats.totals.points' },
		{ title: '+/-', key: 'stats.totals.plusMinus' }
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
			if (column.includes('height') && itemA) {
				const { feet, inches } = itemA;
				itemA = feet * 12 + inches;
			}
			if (column.includes('height') && itemB) {
				const { feet, inches } = itemB;
				itemB = feet * 12 + inches;
			}
			if (itemA && itemB) {
				return itemA < itemB ? -1 * sortModifier : itemA > itemB ? 1 * sortModifier : 0;
			} else if (!itemA && itemB) {
				return 1 * sortModifier;
			} else {
				return -1 * sortModifier;
			}
		};
		data = data.sort(sort);
	};

	// $: console.log(data);
</script>

<Table>
	<THead slot="thead" {colHeaders} {sort} {sortBy} />
	<svelte:fragment slot="tbody">
		{#each data as { player, stats, positionShort, jerseyNumber }, i}
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
								{/if}
							</div>
							{#if jerseyNumber}
								<div class="text-xs font-small leading-5 text-gray-700 dark:text-gray-300">
									{jerseyNumber}
								</div>
							{/if}
						</div>
					</div>
				</td>

				<!-- Display Player Min (Min) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.minutes}
							{stats.totals?.minutes}
						{/if}
					</div>
				</td>

				<!-- Display Player FieldGoalsMade (FG) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.fieldGoalsMade}
							{stats.totals?.fieldGoalsMade}
						{/if}
					</div>
				</td>

				<!-- Display Player FieldGoalsAttempted (FGA) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.fieldGoalsAttempted}
							{stats.totals?.fieldGoalsAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player FieldGoalPct (FG%) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.fieldGoalsPct}
							{formatPct(stats.totals?.fieldGoalsPct)}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersMade (3PM) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.threePointersMade}
							{stats.totals?.threePointersMade}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersAttempted (3PA) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.threePointersAttempted}
							{stats.totals?.threePointersAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player threePointersPct (3P%) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.threePointersPct}
							{formatPct(stats.totals?.threePointersPct)}
						{/if}
					</div>
				</td>

				<!-- Display Player freeThrowsMade (FTM) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.freeThrowsMade}
							{stats.totals?.freeThrowsMade}
						{/if}
					</div>
				</td>

				<!-- Display Player freeThrowsAttempted (FTA) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.freeThrowsAttempted}
							{stats.totals?.freeThrowsAttempted}
						{/if}
					</div>
				</td>

				<!-- Display Player freeThrowsPct (FT%) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.freeThrowsPct}
							{formatPct(stats.totals?.freeThrowsPct)}
						{/if}
					</div>
				</td>

				<!-- Display Player offReb (ORB) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.offReb}
							{stats.totals?.offReb}
						{/if}
					</div>
				</td>

				<!-- Display Player defReb (DRB) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.defReb}
							{stats.totals?.defReb}
						{/if}
					</div>
				</td>

				<!-- Display Player totalReb (TRB) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.totalReb}
							{stats.totals?.totalReb}
						{/if}
					</div>
				</td>

				<!-- Display Player totalReb (AST) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.assists}
							{stats.totals?.assists}
						{/if}
					</div>
				</td>

				<!-- Display Player steals (STL) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.steals}
							{stats.totals?.steals}
						{/if}
					</div>
				</td>

				<!-- Display Player blocks (BLK) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.blocks}
							{stats.totals?.blocks}
						{/if}
					</div>
				</td>

				<!-- Display Player personalFouls (PF) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.personalFouls}
							{stats.totals?.personalFouls}
						{/if}
					</div>
				</td>

				<!-- Display Player points (PTS) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.points}
							{stats.totals?.points}
						{/if}
					</div>
				</td>

				<!-- Display Player plusMinus (+/-) -->
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if stats.totals?.plusMinus}
							{stats.totals?.plusMinus}
						{/if}
					</div>
				</td>
			</tr>
		{/each}
	</svelte:fragment>
</Table>
