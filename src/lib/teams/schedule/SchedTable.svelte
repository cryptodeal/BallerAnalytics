<script>
	import dayjs from 'dayjs';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	dayjs.extend(customParseFormat);
	export let schedule;
	$: console.log(schedule);
	export let teamId;
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
					</tr>
				</thead>
				<tbody>
					{#each schedule as { home, visitor, date, time }}
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
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
