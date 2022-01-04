<script lang="ts">
	import type { GameScheduleItem, TeamRecord } from '$lib/types';
	import type { mongoose } from '@balleranalytics/nba-api-ts';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	dayjs.extend(utc);
	dayjs.extend(timezone);
	export let teamId: mongoose.Types.ObjectId;
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
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								W-L
							</th>
						</tr>
					</thead>
					<tbody class="text-black">
						{#each schedule as { home, visitor, date, time }, i}
							<tr>
								<!-- Display Game Date and Time -->
								<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200  md:px-4 xl:px-6">
									<div class="text-sm font-bold leading-5">
										{#if time}
											{dayjs(date).utc().tz('America/New_York').format('ddd, MMM D @ h:mm A')}
										{:else}
											{dayjs(date).format('ddd, MMM D')}
										{/if}
									</div>
								</td>
								<!-- Display Opposing Team -->
								<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6">
									<div class="flex inline-flex items-center whitespace-nowrap">
										{#if teamId == home.team._id}
											<div class="text-sm leading-5 mr-2">
												vs {capitalizeFirstLetter(home.team.infoCommon.slug)}
											</div>
										{:else}
											<div class="text-sm leading-5 mr-2">
												@ {capitalizeFirstLetter(home.team.infoCommon.slug)}
											</div>
										{/if}
										<img
											class="antialiased w-12 h-12"
											src="/teams/assets/min-{visitor.team.infoCommon.slug}.svg"
											alt="{visitor.team.infoCommon.slug} logo"
										/>
									</div>
								</td>
								{#if time}
									{#if dayjs(date)
										.utc()
										.tz('America/New_York')
										.isBefore(dayjs().utc().tz('America/New_York'))}
										<td class="px-2 py-4 border-b border-gray-200 md:px-4 xl:px-6">
											<div
												class="text-sm leading-5 whitespace-nowrap flex inline-flex items-center text-wrap"
											>
												{#if (teamId == home.team._id && home.stats.totals.points > visitor.stats.totals.points) || (teamId == visitor.team._id && visitor.stats.totals.points > home.stats.totals.points)}
													<div class="text-green-700 font-bold mr-0.5">W</div>
												{:else}
													<div class="text-red-700 font-bold mr-0.5">L</div>
												{/if}
												<div>
													{home.stats.totals.points > visitor.stats.totals.points
														? `${home.stats.totals.points}-${visitor.stats.totals.points}`
														: `${visitor.stats.totals.points}-${home.stats.totals.points}`}
												</div>
											</div>
										</td>

										<td
											class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6"
										>
											<div class="text-sm leading-5">
												{`${getRecord(i).wins}-${getRecord(i).losses}`}
											</div>
										</td>
									{:else}
										<td
											class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6"
										>
											<div class="text-sm leading-5">--</div>
										</td>

										<td
											class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6"
										>
											<div class="text-sm leading-5">--</div>
										</td>
									{/if}
								{:else if dayjs(date).isBefore(dayjs())}
									<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200  md:px-4 xl:px-6">
										<div class="text-sm leading-5">
											<div class="flex inline-flex items-center">
												{#if (teamId == home.team._id && home.stats.totals.points > visitor.stats.totals.points) || (teamId == visitor.team._id && visitor.stats.totals.points > home.stats.totals.points)}
													<div class="text-green-700 font-bold">W</div>
												{:else}
													<div class="text-red-700 font-bold">L</div>
												{/if}
												<div>
													{home.stats.totals.points > visitor.stats.totals.points
														? `${home.stats.totals.points}-${visitor.stats.totals.points}`
														: `${visitor.stats.totals.points}-${home.stats.totals.points}`}
												</div>
											</div>
										</div>
									</td>

									<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6">
										<div class="text-sm leading-5">
											{`${getRecord(i).wins}-${getRecord(i).losses}`}
										</div>
									</td>
								{:else}
									<td class="px-2 py-4 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6">
										<div class="text-sm leading-5">--</div>
									</td>

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
