<script>
	import dayjs from 'dayjs';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	dayjs.extend(customParseFormat);
	export let schedule;
	$: console.log(schedule);
	export let teamId;
	let now = dayjs();

	const getRecord = (index) => {
		const record = {
			wins: 0,
			losses: 0
		};
		for (let i = 0; i < index + 1; i++) {
			//Broken for teams that don't exist in database like Milan
			//aka foreign teams. change conditional to first check home then separate if for visitor
			if (
				teamId == schedule[i].home.id._id &&
				schedule[i].home.stats.points > schedule[i].visitor.stats.points
			) {
				record.wins++;
			} else if (
				teamId == schedule[i].visitor.id._id &&
				schedule[i].visitor.stats.points > schedule[i].home.stats.points
			) {
				record.wins++;
			} else {
				record.losses++;
			}
		}
		return record;
	};
</script>

<div class="flex flex-col w-full">
	<div class="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
		<div
			class="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg"
		>
			<table class="min-w-full">
				<thead>
					<tr>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Date
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Opponent
						</th>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Time
						</th>
						{#if dayjs(`${schedule[0].date}-${schedule[0].time}`, 'YYYYMMDD-HHmm').isBefore(now)}
							<th
								class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
							>
								Result
							</th>
							<th
								class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
							>
								W-L
							</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each schedule as { home, visitor, date, time }, i}
						<tr>
							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="text-sm font-bold leading-5 text-gray-500">
									{dayjs(date, 'YYYYMMDD').format('ddd, MMM D')}
								</div>
							</td>

							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								{#if teamId == home.id._id}
									<div class="flex items-center">
										<div class="flex-shrink-0 w-10 h-10 mr-2">
											<img
												src="/teams/{visitor.id.infoCommon.slug}.svg"
												alt="{visitor.id.infoCommon.city} {visitor.id.infoCommon.name} logo"
											/>
										</div>
										<div class="text-sm leading-5 text-gray-500">
											vs {visitor.id.infoCommon.city}
											{visitor.id.infoCommon.name}
										</div>
									</div>
								{:else}
									<div class="flex items-center">
										<div class="flex-shrink-0 w-10 h-10 mr-2">
											<img
												src="/teams/{home.id.infoCommon.slug}.svg"
												alt="{home.id.infoCommon.city} {home.id.infoCommon.name} logo"
											/>
										</div>
										<div class="text-sm leading-5 text-gray-500">
											@ {home.id.infoCommon.city}
											{home.id.infoCommon.name}
										</div>
									</div>
								{/if}
							</td>

							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="text-sm leading-5 text-gray-500">
									{dayjs(`${date}-${time}`, 'YYYYMMDD-HHmm').subtract(1, 'hour').format('h:mm A')} CT
								</div>
							</td>

							{#if dayjs(`${date}-${time}`, 'YYYYMMDD-HHmm').isBefore(now)}
								<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
									<div class="text-sm leading-5 text-gray-500">
										{#if (teamId == home.id._id && home.stats.points > visitor.stats.points) || (teamId == visitor.id._id && visitor.stats.points > home.stats.points)}
											<span class="text-green-400 font-bold mr-1">W</span>
										{:else}
											<span class="text-red-500 font-bold mr-1">L</span>
										{/if}
										<span
											>{home.stats.points > visitor.stats.points
												? `${home.stats.points}-${visitor.stats.points}`
												: `${visitor.stats.points}-${home.stats.points}`}</span
										>
									</div>
								</td>

								<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
									<div class="text-sm leading-5 text-gray-500">
										{`${getRecord(i).wins}-${getRecord(i).losses}`}
									</div>
								</td>
							{:else if dayjs(`${schedule[0].date}-${schedule[0].time}`, 'YYYYMMDD-HHmm').isBefore(now)}
								<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
									<div class="text-sm leading-5 text-gray-500">--</div>
								</td>

								<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
									<div class="text-sm leading-5 text-gray-500">--</div>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
