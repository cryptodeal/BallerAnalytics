<script>
	export let coaches;
</script>

<div class="flex flex-col md:w-1/2">
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
							Position</th
						>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Name</th
						>
					</tr>
				</thead>
				<tbody>
					{#each coaches as { coach, coachType }}
						<tr>
							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="text-sm font-bold leading-5 text-gray-500">{coachType}</div>
							</td>

							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="text-sm leading-5 text-gray-500">{coach.name.full}</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
