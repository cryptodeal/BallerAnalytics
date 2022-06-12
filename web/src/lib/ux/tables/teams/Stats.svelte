<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { formatPct, getAge } from '$lib/functions/helpers';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import { resolve } from '$lib/functions/helpers';
	import type { Player2StatsObject } from '@balleranalytics/nba-api-ts';
	import type { IColHeader, ISortBy } from '../types';
	import TFoot from '../core/TFoot.svelte';
	export let roster: Player2StatsObject[], season: number;

	let sortBy: ISortBy = { col: 'name.full', ascending: true };

	$: if (season) sortBy = { col: 'name.full', ascending: true };

	const colHeaders: IColHeader[] = [
		{ title: 'Name', subtext: '* 2-Way contract', key: 'name.full' },
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
		{#each roster as { birthDate, meta, stats, name }, i}
			{@const [
				{
					totals: {
						games,
						gamesStarted,
						minutes,
						fieldGoalsMade,
						fieldGoalsAttempted,
						fieldGoalsPct,
						threePointersMade,
						threePointersAttempted,
						threePointersPct,
						twoPointFGMade,
						twoPointFGAttempted,
						twoPointFGPct,
						effectiveFieldGoalPct,
						freeThrowsMade,
						freeThrowsAttempted,
						freeThrowsPct,
						offReb,
						defReb,
						totalReb,
						assists,
						steals,
						blocks,
						turnovers,
						personalFouls,
						points
					},
					twoWay
				}
			] =
				stats && stats[0].totals
					? stats
					: [
							{
								totals: {
									games: undefined,
									gamesStarted: undefined,
									minutes: undefined,
									fieldGoalsMade: undefined,
									fieldGoalsAttempted: undefined,
									fieldGoalsPct: undefined,
									threePointersMade: undefined,
									threePointersAttempted: undefined,
									threePointersPct: undefined,
									twoPointFGMade: undefined,
									twoPointFGAttempted: undefined,
									twoPointFGPct: undefined,
									effectiveFieldGoalPct: undefined,
									freeThrowsMade: undefined,
									freeThrowsAttempted: undefined,
									freeThrowsPct: undefined,
									offReb: undefined,
									defReb: undefined,
									totalReb: undefined,
									assists: undefined,
									steals: undefined,
									blocks: undefined,
									turnovers: undefined,
									personalFouls: undefined,
									points: undefined
								},
								twoWay: false
							}
					  ]}
			<tr class="hover">
				<!-- Display Player Name -->
				<td>
					<div class="flex items-center space-x-3">
						<div class="avatar">
							<div class="mask mask-squircle w-12 h-12">
								<Headshot
									avif={meta.images.headshot.avif}
									png={meta.images.headshot.png}
									webp={meta.images.headshot.webp}
									alt="{name.full} headshot"
								/>
							</div>
						</div>
						<div>
							<div class="font-bold">
								{name.full}
								{#if twoWay}
									<span class="text-sm opacity-50">*</span>
								{/if}
							</div>
						</div>
					</div>
				</td>

				<!-- Display Player Age -->
				<td>
					<div>
						{#if birthDate}
							{getAge(new Date(birthDate).toString())}
						{/if}
					</div>
				</td>

				<!-- Display Player Games Played -->
				<td>
					{#if games}
						{games}
					{:else}
						0
					{/if}
				</td>

				<!-- Display Player Games Started -->
				<td>
					{#if gamesStarted}
						{gamesStarted}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player Minutes -->
				<td>
					{#if minutes}
						{minutes}
					{/if}
				</td>

				<!-- Display Player fieldGoalsMade -->
				<td>
					{#if fieldGoalsMade}
						{fieldGoalsMade}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player fieldGoalsAttempted -->
				<td>
					{#if fieldGoalsAttempted}
						{fieldGoalsAttempted}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player fieldGoalsPct -->
				<td>
					{#if fieldGoalsPct}
						{formatPct(fieldGoalsPct)}
					{:else if fieldGoalsAttempted && fieldGoalsMade}
						{formatPct(fieldGoalsMade / freeThrowsAttempted)}
					{:else if fieldGoalsAttempted && !fieldGoalsMade}
						{formatPct(0)}
					{/if}
				</td>

				<!-- Display Player threePointersMade -->
				<td>
					{#if threePointersMade}
						{threePointersMade}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player threePointersAttempted -->
				<td>
					{#if threePointersAttempted}
						{threePointersAttempted}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player threePointersPct -->
				<td>
					{#if threePointersPct}
						{formatPct(threePointersPct)}
					{:else if threePointersAttempted && threePointersMade}
						{formatPct(threePointersMade / threePointersAttempted)}
					{:else if threePointersAttempted && !threePointersMade}
						{formatPct(0)}
					{/if}
				</td>

				<!-- Display Player twoPointFGMade -->
				<td>
					{#if twoPointFGMade}
						{twoPointFGMade}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player twoPointFGAttempted -->
				<td>
					{#if twoPointFGAttempted}
						{twoPointFGAttempted}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player twoPointFGPct -->
				<td>
					{#if twoPointFGPct}
						{formatPct(twoPointFGPct)}
					{:else if twoPointFGAttempted && twoPointFGMade}
						{formatPct(twoPointFGMade / twoPointFGAttempted)}
					{:else if twoPointFGAttempted && !twoPointFGMade}
						{formatPct(0)}
					{/if}
				</td>

				<!-- Display Player effectiveFieldGoalPct -->
				<td>
					{#if effectiveFieldGoalPct}
						{formatPct(effectiveFieldGoalPct)}
					{:else if fieldGoalsMade && threePointersMade && fieldGoalsAttempted}
						{formatPct((fieldGoalsMade + 0.5 * threePointersMade) / fieldGoalsAttempted)}
					{:else if (!fieldGoalsMade || !threePointersMade) && fieldGoalsAttempted && fieldGoalsAttempted > 0}
						{formatPct(0)}
					{/if}
				</td>

				<!-- Display Player freeThrowsMade -->
				<td>
					{#if freeThrowsMade}
						{freeThrowsMade}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player freeThrowsAttempted -->
				<td>
					{#if freeThrowsAttempted}
						{freeThrowsAttempted}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player freeThrowsPct -->
				<td>
					{#if freeThrowsPct}
						{formatPct(freeThrowsPct)}
					{:else if freeThrowsAttempted && freeThrowsMade}
						{formatPct(freeThrowsMade / freeThrowsAttempted)}
					{:else if freeThrowsAttempted && !freeThrowsMade}
						{formatPct(0)}
					{/if}
				</td>

				<!-- Display Player offReb -->
				<td>
					{#if offReb}
						{offReb}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player defReb -->
				<td>
					{#if defReb}
						{defReb}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player totalReb -->
				<td>
					{#if totalReb}
						{totalReb}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player assists -->
				<td>
					{#if assists}
						{assists}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player steals -->
				<td>
					{#if steals}
						{steals}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player blocks -->
				<td>
					{#if blocks}
						{blocks}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player turnovers -->
				<td>
					{#if turnovers}
						{turnovers}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player personalFouls -->
				<td>
					{#if personalFouls}
						{personalFouls}
					{:else if games && games > 0}
						0
					{/if}
				</td>

				<!-- Display Player points -->
				<td>
					{#if points}
						{points}
					{:else if games && games > 0}
						0
					{/if}
				</td>
			</tr>
		{/each}
	</svelte:fragment>
	<TFoot slot="tfoot" {colHeaders} />
</Table>
