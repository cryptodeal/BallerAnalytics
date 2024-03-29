<script lang="ts">
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { resolve, formatPct } from '$lib/functions/helpers';

	import type { IColHeader, ISortBy } from '../types';
	import type { BoxScoreData } from '$lib/types';
	import TFoot from '../core/TFoot.svelte';

	export let boxscore: BoxScoreData, isHome: boolean;
	$: data = isHome ? boxscore.home.players : boxscore.visitor.players;

	let sortBy: ISortBy = { col: 'stats.totals.minutes', ascending: true };
	$: if (boxscore !== null) {
		sortBy = { col: 'stats.totals.minutes', ascending: true };
	}

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
				return -1 * sortModifier;
			} else if (itemA && !itemB) {
				return 1 * sortModifier;
			} else {
				return 0;
			}
		};
		data = data.sort(sort);
	};
</script>

<Table>
	<THead slot="thead" {colHeaders} {sort} {sortBy} />
	<svelte:fragment slot="tbody">
		{#each data as { player, stats, jerseyNumber }, i}
			<tr class="hover">
				<!-- Display Player Name -->
				<th>
					<div class="flex items-center space-x-3">
						<div class="avatar">
							<div class="mask mask-squircle w-12 h-12">
								<Headshot
									avif={player.meta.images.headshot.avif}
									png={player.meta.images.headshot.png}
									webp={player.meta.images.headshot.webp}
									alt="{player.name.full} headshot"
								/>
							</div>
						</div>
						<div>
							<div class="font-bold">{player.name.full}</div>
							{#if jerseyNumber}
								<div class="text-sm opacity-50">{jerseyNumber}</div>
							{/if}
						</div>
					</div>
				</th>

				<!-- Display Player Min (Min) -->
				<td>
					{#if stats.totals?.minutes}
						{stats.totals?.minutes}
					{/if}
				</td>

				<!-- Display Player FieldGoalsMade (FG) -->
				<td>
					{#if stats.totals?.fieldGoalsMade}
						{stats.totals?.fieldGoalsMade}
					{/if}
				</td>

				<!-- Display Player FieldGoalsAttempted (FGA) -->
				<td>
					{#if stats.totals?.fieldGoalsAttempted}
						{stats.totals?.fieldGoalsAttempted}
					{/if}
				</td>

				<!-- Display Player FieldGoalPct (FG%) -->
				<td>
					{#if stats.totals?.fieldGoalsPct}
						{formatPct(stats.totals?.fieldGoalsPct)}
					{/if}
				</td>

				<!-- Display Player threePointersMade (3PM) -->
				<td>
					{#if stats.totals?.threePointersMade}
						{stats.totals?.threePointersMade}
					{/if}
				</td>

				<!-- Display Player threePointersAttempted (3PA) -->
				<td>
					{#if stats.totals?.threePointersAttempted}
						{stats.totals?.threePointersAttempted}
					{/if}
				</td>

				<!-- Display Player threePointersPct (3P%) -->
				<td>
					{#if stats.totals?.threePointersPct}
						{formatPct(stats.totals?.threePointersPct)}
					{/if}
				</td>

				<!-- Display Player freeThrowsMade (FTM) -->
				<td>
					{#if stats.totals?.freeThrowsMade}
						{stats.totals?.freeThrowsMade}
					{/if}
				</td>

				<!-- Display Player freeThrowsAttempted (FTA) -->
				<td>
					{#if stats.totals?.freeThrowsAttempted}
						{stats.totals?.freeThrowsAttempted}
					{/if}
				</td>

				<!-- Display Player freeThrowsPct (FT%) -->
				<td>
					{#if stats.totals?.freeThrowsPct}
						{formatPct(stats.totals?.freeThrowsPct)}
					{/if}
				</td>

				<!-- Display Player offReb (ORB) -->
				<td>
					{#if stats.totals?.offReb}
						{stats.totals?.offReb}
					{/if}
				</td>

				<!-- Display Player defReb (DRB) -->
				<td>
					{#if stats.totals?.defReb}
						{stats.totals?.defReb}
					{/if}
				</td>

				<!-- Display Player totalReb (TRB) -->
				<td>
					{#if stats.totals?.totalReb}
						{stats.totals?.totalReb}
					{/if}
				</td>

				<!-- Display Player totalReb (AST) -->
				<td>
					{#if stats.totals?.assists}
						{stats.totals?.assists}
					{/if}
				</td>

				<!-- Display Player steals (STL) -->
				<td>
					{#if stats.totals?.steals}
						{stats.totals?.steals}
					{/if}
				</td>

				<!-- Display Player blocks (BLK) -->
				<td>
					{#if stats.totals?.blocks}
						{stats.totals?.blocks}
					{/if}
				</td>

				<!-- Display Player personalFouls (PF) -->
				<td>
					{#if stats.totals?.personalFouls}
						{stats.totals?.personalFouls}
					{/if}
				</td>

				<!-- Display Player points (PTS) -->
				<td>
					{#if stats.totals?.points}
						{stats.totals?.points}
					{/if}
				</td>

				<!-- Display Player plusMinus (+/-) -->
				<td>
					{#if stats.totals?.plusMinus}
						{stats.totals?.plusMinus}
					{/if}
				</td>
			</tr>
		{/each}
	</svelte:fragment>
	<TFoot slot="tfoot" {colHeaders} />
</Table>
