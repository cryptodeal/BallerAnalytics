<script lang="ts">
	import dayjs from 'dayjs';
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	import { dailyGames } from '$lib/data/stores/games';
	import type { GameScheduleItem, TeamRecord } from '$lib/types';
	import type { Types } from 'mongoose';

	export let teamId: Types.ObjectId;
	export let schedule: GameScheduleItem[];

	const getRecord = (index: number): TeamRecord => {
		const record: TeamRecord = {
			wins: 0,
			losses: 0
		};
		for (let i = 0; i < index + 1; i++) {
			if (
				(teamId == schedule[i].home.team._id &&
					schedule[i].home.stats.totals.points > schedule[i].visitor.stats.totals.points) ||
				(teamId == schedule[i].visitor.team._id &&
					schedule[i].visitor.stats.totals.points > schedule[i].home.stats.totals.points)
			) {
				record.wins++;
			} else {
				record.losses++;
			}
		}
		return record;
	};
</script>

<div class="my-2 bg-white backdrop-filter backdrop-blur-lg bg-opacity-40 text-black md:(mx-auto)">
	<div class="flex flex-col w-full">
		<div class="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
			<div
				class="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg"
			>
				<table class="min-w-full">
					<thead>
						<tr>
							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								Date/Time (ET)
							</th>
							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								Opponent
							</th>

							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left uppercase border-b border-gray-200  md:px-4 xl:px-6"
							>
								Result
							</th>
							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left whitespace-nowrap uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								W-L
							</th>
						</tr>
					</thead>
					<tbody class="text-black">
						{#each schedule as { home, visitor, date, time, meta, _id }, i}
							<tr>
								<!-- Display Game Date and Time -->
								<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200  md:px-4 xl:px-6">
									<div class="text-sm font-bold leading-5">
										{#if time}
											{dayjs(date).format('ddd, MMM D @ h:mm A')}
										{:else}
											{dayjs(date).format('ddd, MMM D')}
										{/if}
									</div>
								</td>
								<!-- Display Opposing Team -->
								<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6">
									<div class="flex inline-flex items-center whitespace-nowrap">
										{#if teamId == home.team._id}
											<div class="text-sm leading-5 mr-2">vs</div>
											<div class="flex flex-col w-auto justify-center">
												<img
													class="antialiased mx-auto"
													height="48px"
													width="48px"
													src="/teams/assets/min-{visitor.team.infoCommon.slug}.svg"
													alt="{visitor.team.infoCommon.slug} logo"
												/>
												<div class="text-sm text-center leading-5">
													{capitalizeFirstLetter(visitor.team.infoCommon.slug)}
												</div>
											</div>
										{:else}
											<div class="text-sm leading-5 mr-2">@</div>
											<div class="flex flex-col w-auto justify-center">
												<img
													class="antialiased mx-auto"
													height="48px"
													width="48px"
													src="/teams/assets/min-{home.team.infoCommon.slug}.svg"
													alt="{home.team.infoCommon.slug} logo"
												/>
												<div class="text-sm text-center leading-5">
													{capitalizeFirstLetter(home.team.infoCommon.slug)}
												</div>
											</div>
										{/if}
									</div>
								</td>
								{#if home.stats.totals?.points && visitor.stats.totals?.points}
									<td class="px-2 py-4 border-b border-gray-200 md:px-4 xl:px-6">
										<div
											class="text-sm leading-5 whitespace-nowrap flex inline-flex items-center text-wrap"
										>
											{#if (teamId == home.team._id && home.stats.totals.points > visitor.stats.totals.points && meta.helpers.isOver) || (teamId == visitor.team._id && visitor.stats.totals.points > home.stats.totals.points && meta.helpers.isOver)}
												<div class="text-green-700 font-bold mr-0.5">W</div>
											{:else if meta.helpers.isOver}
												<div class="text-red-700 font-bold mr-0.5">L</div>
											{:else if !meta.helpers.isOver && home.stats.totals.points && visitor.stats.totals.points}
												<div class="text-red-600 font-bold animate-pulse text-sm mr-2">Live</div>
											{/if}
											{#if $dailyGames && $dailyGames[_id]}
												<div class="flex inline-flex">
													{#if $dailyGames[_id].home.score === $dailyGames[_id].visitor.score}
														{$dailyGames[_id].home.score}&nbsp;-&nbsp;{$dailyGames[_id].visitor
															.score}
													{:else if teamId.toString() == $dailyGames[_id].home._id && $dailyGames[_id].home.score > $dailyGames[_id].visitor.score}
														<div class="text-green-700 font-semibold">
															{$dailyGames[_id].home.score}
														</div>
														&nbsp;-&nbsp;{$dailyGames[_id].visitor.score}
													{:else if teamId.toString() == $dailyGames[_id].home._id}
														<div class="text-red-700 font-semibold">
															{$dailyGames[_id].home.score}
														</div>
														&nbsp;-&nbsp;{$dailyGames[_id].visitor.score}
													{:else if teamId.toString() == $dailyGames[_id].visitor._id && $dailyGames[_id].visitor.score > $dailyGames[_id].home.score}
														{$dailyGames[_id].home.score}&nbsp;-&nbsp;
														<div class="text-green-700 font-semibold">
															{$dailyGames[_id].visitor.score}
														</div>
													{:else}
														{$dailyGames[_id].home.score}&nbsp;-&nbsp;
														<div class="text-red-700 font-semibold">
															{$dailyGames[_id].visitor.score}
														</div>
													{/if}
												</div>
											{:else}
												<div class="flex inline-flex">
													{#if home.stats.totals.points === visitor.stats.totals.points}
														{home.stats.totals.points}&nbsp;-&nbsp;{visitor.stats.totals.points}
													{:else if teamId == home.team._id && home.stats.totals.points > visitor.stats.totals.points}
														<div class="text-green-700 font-semibold">
															{home.stats.totals.points}
														</div>
														&nbsp;-&nbsp;{visitor.stats.totals.points}
													{:else if teamId == home.team._id}
														<div class="text-red-700 font-semibold">
															{home.stats.totals.points}
														</div>
														&nbsp;-&nbsp;{visitor.stats.totals.points}
													{:else if teamId == visitor.team._id && visitor.stats.totals.points > home.stats.totals.points}
														{home.stats.totals.points}&nbsp;-&nbsp;
														<div class="text-green-700 font-semibold">
															{visitor.stats.totals.points}
														</div>
													{:else}
														{home.stats.totals.points}&nbsp;-&nbsp;
														<div class="text-red-700 font-semibold">
															{visitor.stats.totals.points}
														</div>
													{/if}
												</div>
											{/if}
										</div>
									</td>
								{:else}
									<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6">
										<div class="text-sm leading-5">--</div>
									</td>
								{/if}
								{#if meta.helpers.isOver}
									<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6">
										<div class="text-sm leading-5">
											{`${getRecord(i).wins}-${getRecord(i).losses}`}
										</div>
									</td>
								{:else}
									<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6">
										<div class="text-sm leading-5">--</div>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
