<script>
	import Headshot from '$lib/img/Headshot.svelte';
	export let players;
	export let season;
	let sortBy = { col: 'fullName', ascending: true };
	$: if (season) sortBy = { col: 'fullName', ascending: true };

	$: sort = (column) => {
		if (sortBy.col == column) {
			sortBy.ascending = !sortBy.ascending;
		} else {
			sortBy.col = column;
			sortBy.ascending = true;
		}

		// Modifier to sorting function for ascending or descending
		let sortModifier = sortBy.ascending ? 1 : -1;

		let sort = (a, b) =>
			a[column] < b[column] ? -1 * sortModifier : a[column] > b[column] ? 1 * sortModifier : 0;

		players = players.sort(sort);
	};
</script>

<div class="flex flex-col">
	<div class="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
		<div
			class="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg"
		>
			<table class="min-w-full">
				<thead>
					<tr>
						<th
							on:click={sort('fullName')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Name</div>
								<div class="ml-1 w-4 h4">
									{#if sortBy.col == 'fullName'}
										{#if sortBy.ascending}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
												><path d="M24 22h-24l12-20z" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												style="transform:rotate(180deg);"
												viewBox="0 0 24 24"><path d="M24 22h-24l12-20z" /></svg
											>
										{/if}
									{/if}
								</div>
							</div>
						</th>
						<th
							on:click={sort('position')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Pos</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'position'}
										{#if sortBy.ascending}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
												><path d="M24 22h-24l12-20z" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												style="transform:rotate(180deg);"
												viewBox="0 0 24 24"><path d="M24 22h-24l12-20z" /></svg
											>
										{/if}
									{/if}
								</div>
							</div>
						</th>
						<th
							on:click={sort('age')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Age</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'age'}
										{#if sortBy.ascending}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
												><path d="M24 22h-24l12-20z" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												style="transform:rotate(180deg);"
												viewBox="0 0 24 24"><path d="M24 22h-24l12-20z" /></svg
											>
										{/if}
									{/if}
								</div>
							</div>
						</th>
						<th
							on:click={sort('heightSortHelper')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Ht</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'heightSortHelper'}
										{#if sortBy.ascending}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
												><path d="M24 22h-24l12-20z" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												style="transform:rotate(180deg);"
												viewBox="0 0 24 24"><path d="M24 22h-24l12-20z" /></svg
											>
										{/if}
									{/if}
								</div>
							</div>
						</th>
						<th
							on:click={sort('weight')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Wt</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'weight'}
										{#if sortBy.ascending}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
												><path d="M24 22h-24l12-20z" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												style="transform:rotate(180deg);"
												viewBox="0 0 24 24"><path d="M24 22h-24l12-20z" /></svg
											>
										{/if}
									{/if}
								</div>
							</div>
						</th>
						<th
							on:click={sort('school')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>College</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'school'}
										{#if sortBy.ascending}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
												><path d="M24 22h-24l12-20z" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												style="transform:rotate(180deg);"
												viewBox="0 0 24 24"><path d="M24 22h-24l12-20z" /></svg
											>
										{/if}
									{/if}
								</div>
							</div>
						</th>
						<!--
              <th
                class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
              >
                Salary</th
              >
            -->
					</tr>
				</thead>
				<tbody>
					{#each players as { age, fullName, height, number, player, position, school, weight }}
						<tr>
							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="flex items-center">
									<div class="flex-shrink-0 w-10 h-10">
										<Headshot
											src="https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/{player._id}.png"
											alt="{fullName} headshot"
										/>
									</div>

									<div class="ml-4">
										<div class="text-sm font-medium leading-5 text-gray-900">
											{fullName}
										</div>
										{#if number}
											<div class="text-xs font-small leading-5 text-gray-500">{number}</div>
										{/if}
									</div>
								</div>
							</td>

							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="text-sm leading-5 text-gray-500">{position}</div>
							</td>

							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="text-sm leading-5 text-gray-500">{age}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{height}</div>
							</td>
							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{weight}</div>
							</td>
							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">
									{school ? school : '--'}
								</div>
							</td>
							<!--
                <td
                  class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
                >
                  <div class="text-sm leading-5 text-gray-500">Salary</div>
                </td>
              -->
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
