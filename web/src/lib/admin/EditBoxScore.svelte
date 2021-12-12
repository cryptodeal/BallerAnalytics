<script>
	import { addPeriodValue } from '$lib/_db/utils';
	export let gameData;
	export let team;
	export let period;
	export let edit;

	//$: console.log(period)
	$: if (period !== 'game') {
		let i = gameData[team].stats.periods.findIndex((p) => p.periodName === period);
		if (i == -1 && period !== null && period !== undefined) {
			const data = {
				periodValue: addPeriodValue(period),
				periodName: period,
				fieldGoalsMade: null,
				fieldGoalsAttempted: null,
				fieldGoalsPct: null,
				threePointersMade: null,
				threePointersAttempted: null,
				threePointersPct: null,
				freeThrowsMade: null,
				freeThrowsAttempted: null,
				freeThrowsPct: null,
				offReb: null,
				defReb: null,
				totalReb: null,
				assists: null,
				steals: null,
				blocks: null,
				turnovers: null,
				personalFouls: null,
				points: null
			};
			gameData[team].stats.periods.push(data);
		}
		for (let j = 0; j < gameData[team].players.length; j++) {
			let i = gameData[team].players[j].stats.periods.findIndex((p) => p.periodName === period);
			if (i == -1 && period !== null && period !== undefined) {
				const data = {
					periodValue: addPeriodValue(period),
					periodName: period,
					active: false,
					stats: {
						minutes: null,
						seconds: null,
						fieldGoalsMade: null,
						fieldGoalsAttempted: null,
						fieldGoalsPct: null,
						threePointersMade: null,
						threePointersAttempted: null,
						threePointersPct: null,
						freeThrowsMade: null,
						freeThrowsAttempted: null,
						freeThrowsPct: null,
						offReb: null,
						defReb: null,
						totalReb: null,
						assists: null,
						steals: null,
						blocks: null,
						turnovers: null,
						personalFouls: null,
						points: null,
						plusMinus: null
					}
				};
				gameData[team].players[j].stats.periods.push(data);
			} else if (!gameData[team].players[j].stats.periods[i].stats) {
				gameData[team].players[j].stats.periods[i].stats = {
					minutes: null,
					seconds: null,
					fieldGoalsMade: null,
					fieldGoalsAttempted: null,
					fieldGoalsPct: null,
					threePointersMade: null,
					threePointersAttempted: null,
					threePointersPct: null,
					freeThrowsMade: null,
					freeThrowsAttempted: null,
					freeThrowsPct: null,
					offReb: null,
					defReb: null,
					totalReb: null,
					assists: null,
					steals: null,
					blocks: null,
					turnovers: null,
					personalFouls: null,
					points: null,
					plusMinus: null
				};
			}
		}
	}
	$: console.log(gameData);
</script>

<div class="flex flex-col">
	<div class="py-2 -my-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
		<div
			class="inline-block min-w-full overflow-scroll align-middle border-b border-gray-200 shadow sm:rounded-lg"
		>
			<table class="min-w-full">
				<thead>
					<tr>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							Name
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							Min
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							Sec
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							FG
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							FGA
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							FG%
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							3P
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							3PA
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							3P%
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							FT
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							FTA
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							FT%
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							ORB
						</th>

						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							DRB
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							TRB
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							AST
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							STL
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							BLK
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							TOV
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							PF
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							PTS
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-800 uppercase border-b border-gray-200 bg-gray-50"
						>
							+/-
						</th>
					</tr>
				</thead>
				<tbody>
					{#each gameData[team].players as player, i}
						{#if player.stats?.totals}
							<tr>
								<td
									class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
								>
									{player.player.name.full}
								</td>
								{#if !edit}
									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.minutes == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.minutes
											: player.stats?.totals?.minutes == null
											? '--'
											: player.stats?.totals?.minutes}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.seconds == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.seconds
											: player.stats?.totals?.seconds == null
											? '--'
											: player.stats?.totals?.seconds}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.fieldGoalsMade == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.fieldGoalsMade
											: player.stats?.totals?.fieldGoalsMade == null
											? '--'
											: player.stats?.totals?.fieldGoalsMade}
									</td>
									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.fieldGoalsAttempted == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.fieldGoalsAttempted
											: player.stats?.totals?.fieldGoalsAttempted == null
											? '--'
											: player.stats?.totals?.fieldGoalsAttempted}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.fieldGoalsPct == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.fieldGoalsPct
											: player.stats?.totals?.fieldGoalsPct == null
											? '--'
											: player.stats?.totals?.fieldGoalsPct}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.threePointersMade == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.threePointersMade
											: player.stats?.totals?.threePointersMade == null
											? '--'
											: player.stats?.totals?.threePointersMade}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.threePointersAttempted == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.threePointersAttempted
											: player.stats?.totals?.threePointersAttempted == null
											? '--'
											: player.stats?.totals?.threePointersAttempted}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.threePointersPct == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.threePointersPct
											: player.stats?.totals?.threePointersPct == null
											? '--'
											: player.stats?.totals?.threePointersPct}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.freeThrowsMade == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.freeThrowsMade
											: player.stats?.totals?.freeThrowsMade == null
											? '--'
											: player.stats?.totals?.freeThrowsMade}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.freeThrowsAttempted == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.freeThrowsAttempted
											: player.stats?.totals?.freeThrowsAttempted == null
											? '--'
											: player.stats?.totals?.freeThrowsAttempted}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.freeThrowsPct == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.freeThrowsPct
											: player.stats?.totals?.freeThrowsPct == null
											? '--'
											: player.stats?.totals?.freeThrowsPct}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.offReb == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.offReb
											: player.stats?.totals?.offReb == null
											? '--'
											: player.stats?.totals?.offReb}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.defReb == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.defReb
											: player.stats?.totals?.defReb == null
											? '--'
											: player.stats?.totals?.defReb}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.totalReb == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.totalReb
											: player.stats?.totals?.totalReb == null
											? '--'
											: player.stats?.totals?.totalReb}
									</td>
									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.assists == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.assists
											: player.stats?.totals?.assists == null
											? '--'
											: player.stats?.totals?.assists}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.steals == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.steals
											: player.stats?.totals?.steals == null
											? '--'
											: player.stats?.totals?.steals}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.blocks == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.blocks
											: player.stats?.totals?.blocks == null
											? '--'
											: player.stats?.totals?.blocks}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.turnovers == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.turnovers
											: player.stats?.totals?.turnovers == null
											? '--'
											: player.stats?.totals?.turnovers}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.personalFouls == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.personalFouls
											: player.stats?.totals?.personalFouls == null
											? '--'
											: player.stats?.totals?.personalFouls}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.points == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.points
											: player.stats?.totals?.points == null
											? '--'
											: player.stats?.totals?.points}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{period !== 'game'
											? player.stats?.periods[
													player?.stats?.periods?.findIndex((p) => p.periodName === period)
											  ]?.stats?.plusMinus == null
												? '--'
												: player.stats?.periods[
														player?.stats?.periods?.findIndex((p) => p.periodName === period)
												  ]?.stats?.plusMinus
											: player.stats?.totals?.plusMinus == null
											? '--'
											: player.stats?.totals?.plusMinus}
									</td>
								{:else}
									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.minutes}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.minutes}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.seconds}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.seconds}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.fieldGoalsMade}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.fieldGoalsMade}
											/>
										{/if}
									</td>
									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.fieldGoalsAttempted}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.fieldGoalsAttempted}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.fieldGoalsPct}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.fieldGoalsPct}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.threePointersMade}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.threePointersMade}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.threePointersAttempted}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.threePointersAttempted}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.threePointersPct}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.threePointersPct}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.freeThrowsMade}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.freeThrowsMade}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.freeThrowsAttempted}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.freeThrowsAttempted}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.freeThrowsPct}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.freeThrowsPct}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.offReb}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.offReb}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.defReb}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.defReb}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.totalReb}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.totalReb}
											/>
										{/if}
									</td>
									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.assists}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.assists}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.steals}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.steals}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.blocks}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.blocks}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.turnovers}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.turnovers}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.personalFouls}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.personalFouls}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.points}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.points}
											/>
										{/if}
									</td>

									<td
										class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
									>
										{#if period === 'game'}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.totals.plusMinus}
											/>
										{:else}
											<input
												type="number"
												class="w-18 h-8"
												bind:value={gameData[team].players[i].stats.periods[
													gameData[team].players[i].stats.periods.findIndex(
														(p) => p.periodName === period
													)
												].stats.plusMinus}
											/>
										{/if}
									</td>
								{/if}
							</tr>
						{/if}
					{/each}
					<tr>
						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							Totals
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						/>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						/>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].fieldGoalsMade == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].fieldGoalsMade
									: gameData[team].stats.totals.fieldGoalsMade == null
									? '--'
									: gameData[team].stats.totals.fieldGoalsMade}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.fieldGoalsMade}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].fieldGoalsMade}
								/>
							{/if}
						</td>
						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].fieldGoalsAttempted == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].fieldGoalsAttempted
									: gameData[team].stats.totals.fieldGoalsAttempted == null
									? '--'
									: gameData[team].stats.totals.fieldGoalsAttempted}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.fieldGoalsAttempted}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].fieldGoalsAttempted}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].fieldGoalsPct == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].fieldGoalsPct
									: gameData[team].stats.totals.fieldGoalsPct == null
									? '--'
									: gameData[team].stats.totals.fieldGoalsPct}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.fieldGoalsPct}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].fieldGoalsPct}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].threePointersMade == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].threePointersMade
									: gameData[team].stats.totals.threePointersMade == null
									? '--'
									: gameData[team].stats.totals.threePointersMade}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.threePointersMade}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].threePointersMade}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].threePointersAttempted == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].threePointersAttempted
									: gameData[team].stats.totals.threePointersAttempted == null
									? '--'
									: gameData[team].stats.totals.threePointersAttempted}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.threePointersAttempted}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].threePointersAttempted}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].threePointersPct == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].threePointersPct
									: gameData[team].stats.totals.threePointersPct == null
									? '--'
									: gameData[team].stats.totals.threePointersPct}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.threePointersPct}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].threePointersPct}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].freeThrowsMade == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].freeThrowsMade
									: gameData[team].stats.totals.freeThrowsMade == null
									? '--'
									: gameData[team].stats.totals.freeThrowsMade}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.freeThrowsMade}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].freeThrowsMade}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].freeThrowsAttempted == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].freeThrowsAttempted
									: gameData[team].stats.totals.freeThrowsAttempted == null
									? '--'
									: gameData[team].stats.totals.freeThrowsAttempted}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.freeThrowsAttempted}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].freeThrowsAttempted}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].freeThrowsPct == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].freeThrowsPct
									: gameData[team].stats.totals.freeThrowsPct == null
									? '--'
									: gameData[team].stats.totals.freeThrowsPct}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.freeThrowsPct}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].freeThrowsPct}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].offReb == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].offReb
									: gameData[team].stats.totals.offReb == null
									? '--'
									: gameData[team].stats.totals.offReb}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.offReb}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].offReb}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].defReb == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].defReb
									: gameData[team].stats.totals.defReb == null
									? '--'
									: gameData[team].stats.totals.defReb}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.defReb}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].defReb}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].totalReb == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].totalReb
									: gameData[team].stats.totals.totalReb == null
									? '--'
									: gameData[team].stats.totals.totalReb}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.totalReb}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].totalReb}
								/>
							{/if}
						</td>
						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].assists == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].assists
									: gameData[team].stats.totals.assists == null
									? '--'
									: gameData[team].stats.totals.assists}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.assists}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].assists}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].steals == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].steals
									: gameData[team].stats.totals.steals == null
									? '--'
									: gameData[team].stats.totals.steals}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.steals}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].steals}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].blocks == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].blocks
									: gameData[team].stats.totals.blocks == null
									? '--'
									: gameData[team].stats.totals.blocks}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.blocks}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].blocks}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].turnovers == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].turnovers
									: gameData[team].stats.totals.turnovers == null
									? '--'
									: gameData[team].stats.totals.turnovers}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.turnovers}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].turnovers}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].personalFouls == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].personalFouls
									: gameData[team].stats.totals.personalFouls == null
									? '--'
									: gameData[team].stats.totals.personalFouls}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.personalFouls}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].personalFouls}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						>
							{#if !edit}
								{period !== 'game'
									? gameData[team].stats.periods[
											gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									  ].points == null
										? '--'
										: gameData[team].stats.periods[
												gameData[team].stats.periods.findIndex((p) => p.periodName === period)
										  ].points
									: gameData[team].stats.totals.points == null
									? '--'
									: gameData[team].stats.totals.points}
							{:else if period === 'game'}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.totals.points}
								/>
							{:else}
								<input
									type="number"
									class="w-18 h-8"
									bind:value={gameData[team].stats.periods[
										gameData[team].stats.periods.findIndex((p) => p.periodName === period)
									].points}
								/>
							{/if}
						</td>

						<td
							class="px-6 py-4 text-sm leading-5 text-gray-800 whitespace-no-wrap border-b border-gray-200"
						/>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
