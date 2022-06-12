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
			<tr class="hover">
				<!-- Display Season Year -->
				<td>
					{#if year}
						<div class="font-bold">
							{year - 1}-{year.toString().slice(-2)}
						</div>
					{/if}
				</td>

				<!-- Display Player Age -->
				<td>
					{#if age}
						{age}
					{/if}
				</td>

				<!-- Display Player Team/Totals (if teamSplit) -->
				<td>
					{#if teamSplits.length}
						TOT
					{:else if teams.length}
						{teams[0].id.infoCommon.nbaAbbreviation}
					{/if}
				</td>

				<!-- Display Player Games Played -->
				<td>
					{#if games}
						{games}
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
						{formatPct(fieldGoalsMade / fieldGoalsAttempted)}
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

					<tr class="hover">
						<!-- Display Season Year -->
						<td>
							<div class="font-bold">
								{year - 1}-{year.toString().slice(-2)}
							</div>
						</td>

						<!-- Display Player Age -->
						<td>
							{#if age}
								{age}
							{/if}
						</td>

						<!-- Display Player Team/Totals (if teamSplit) -->
						<td>
							{#if teams.find((t) => t.id._id.toString() === team.toString())}
								{teams.find((t) => t.id._id.toString() === team.toString()).id.infoCommon
									.nbaAbbreviation}
							{/if}
						</td>

						<!-- Display Player Games Played -->
						<td>
							{#if games}
								{games}
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
								{formatPct(fieldGoalsMade / fieldGoalsAttempted)}
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
							{:else if !fieldGoalsMade || (!threePointersMade && fieldGoalsAttempted && fieldGoalsAttempted > 0)}
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
			{/if}
		{/each}
	</svelte:fragment>
</Table>
