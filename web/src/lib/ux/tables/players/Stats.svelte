<script lang="ts">
	import { formatPct, getAge } from '$lib/functions/helpers';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';

	import type { Player2Document, PopulatedDocument } from '@balleranalytics/nba-api-ts';
	import type { IColHeader } from '../types';
	import dayjs from 'dayjs';
	export let player: PopulatedDocument<Player2Document, 'seasons.teams.id'>;

	const colHeaders: IColHeader[] = [
		{ title: 'Season' },
		{ title: 'Age' },
		{ title: 'Teams' },
		{ title: 'G' },
		{ title: 'GS' },
		{ title: 'Min' },
		{ title: 'FG' },
		{ title: 'FGA' },
		{ title: 'FG%' },
		{ title: '3P' },
		{ title: '3PA' },
		{ title: '3P%' },
		{ title: '2P' },
		{ title: '2PA' },
		{ title: '2P%' },
		{ title: 'eFG%' },
		{ title: 'FT' },
		{ title: 'FTA' },
		{ title: 'FT%' },
		{ title: 'ORB' },
		{ title: 'DRB' },
		{ title: 'TRB' },
		{ title: 'AST' },
		{ title: 'STL' },
		{ title: 'BLK' },
		{ title: 'TOV' },
		{ title: 'PF' },
		{ title: 'PTS' }
	];
</script>

<Table>
	<THead slot="thead" {colHeaders} />
	<svelte:fragment slot="tbody">
		{#each player.seasons.filter((s) => s.regularSeason.stats.totals.games) as { year, teams, regularSeason: { stats } }, i}
			{@const {
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
				teamSplits
			} = stats}

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
						{:else if teams.length}
							{teams[0].id.infoCommon.nbaAbbreviation}
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
						{:else if fieldGoalsAttempted && fieldGoalsMade}
							{formatPct(fieldGoalsMade / fieldGoalsAttempted)}
						{:else if fieldGoalsAttempted && !fieldGoalsMade}
							{formatPct(0)}
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
						{:else if threePointersAttempted && threePointersMade}
							{formatPct(threePointersMade / threePointersAttempted)}
						{:else if threePointersAttempted && !threePointersMade}
							{formatPct(0)}
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
						{:else if twoPointFGAttempted && twoPointFGMade}
							{formatPct(twoPointFGMade / twoPointFGAttempted)}
						{:else if twoPointFGAttempted && !twoPointFGMade}
							{formatPct(0)}
						{/if}
					</div>
				</td>
				<!-- Display Player effectiveFieldGoalPct -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if effectiveFieldGoalPct}
							{formatPct(effectiveFieldGoalPct)}
						{:else if fieldGoalsMade && threePointersMade && fieldGoalsAttempted}
							{formatPct((fieldGoalsMade + 0.5 * threePointersMade) / fieldGoalsAttempted)}
						{:else if (!fieldGoalsMade || !threePointersMade) && fieldGoalsAttempted && fieldGoalsAttempted > 0}
							{formatPct(0)}
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
						{:else if freeThrowsAttempted && freeThrowsMade}
							{formatPct(freeThrowsMade / freeThrowsAttempted)}
						{:else if freeThrowsAttempted && !freeThrowsMade}
							{formatPct(0)}
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
			{#if teamSplits.length}
				{#each teamSplits as split, i}
					{@const {
						team,
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
						}
					} = split}

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
								{#if teams.find((t) => t.id._id.toString() === team.toString())}
									{teams.find((t) => t.id._id.toString() === team.toString()).id.infoCommon
										.nbaAbbreviation}
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
								{:else if fieldGoalsAttempted && fieldGoalsMade}
									{formatPct(fieldGoalsMade / fieldGoalsAttempted)}
								{:else if fieldGoalsAttempted && !fieldGoalsMade}
									{formatPct(0)}
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
								{:else if threePointersAttempted && threePointersMade}
									{formatPct(threePointersMade / threePointersAttempted)}
								{:else if threePointersAttempted && !threePointersMade}
									{formatPct(0)}
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
								{:else if twoPointFGAttempted && twoPointFGMade}
									{formatPct(twoPointFGMade / twoPointFGAttempted)}
								{:else if twoPointFGAttempted && !twoPointFGMade}
									{formatPct(0)}
								{/if}
							</div>
						</td>
						<!-- Display Player effectiveFieldGoalPct -->
						<td
							class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
						>
							<div class="text-sm font-bold leading-5">
								{#if effectiveFieldGoalPct}
									{formatPct(effectiveFieldGoalPct)}
								{:else if fieldGoalsMade && threePointersMade && fieldGoalsAttempted}
									{formatPct((fieldGoalsMade + 0.5 * threePointersMade) / fieldGoalsAttempted)}
								{:else if !fieldGoalsMade || (!threePointersMade && fieldGoalsAttempted && fieldGoalsAttempted > 0)}
									{formatPct(0)}
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
								{:else if freeThrowsAttempted && freeThrowsMade}
									{formatPct(freeThrowsMade / freeThrowsAttempted)}
								{:else if freeThrowsAttempted && !freeThrowsMade}
									{formatPct(0)}
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
			{/if}
		{/each}
	</svelte:fragment>
</Table>
