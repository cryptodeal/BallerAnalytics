<script>
	import Headshot from '$lib/img/Headshot.svelte';
	export let players;
	export let season;
	let sortBy = { col: 'fullName', ascending: true };
	$: if (season) sortBy = { col: 'fullName', ascending: true };
	$: if (season) players.sort((a, b) => a.fullName.localeCompare(b.fullName));

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
							on:click={sort('gamesPlayed')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>GP</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'gamesPlayed'}
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
							on:click={sort('minutes')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Min</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'minutes'}
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
							on:click={sort('pts')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Pts</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'pts'}
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
							on:click={sort('oreb')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>OReb</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'oreb'}
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
							on:click={sort('dreb')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>DReb</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'dreb'}
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
							on:click={sort('reb')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Reb</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'reb'}
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
							on:click={sort('ast')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Ast</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'ast'}
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
							on:click={sort('stl')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Stl</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'stl'}
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
							on:click={sort('blk')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Blk</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'blk'}
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
							on:click={sort('tov')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>TO</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'tov'}
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
							on:click={sort('pf')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>PF</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'pf'}
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
							on:click={sort('astTovRatio')}
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							<div class="inline-flex">
								<div>Ast/TO</div>
								<div class="ml-1 w-4 h-4">
									{#if sortBy.col == 'astTovRatio'}
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
					</tr>
				</thead>
				<tbody>
					{#each players as { fullName, player, position, gamesPlayed, minutes, pts, oreb, dreb, reb, ast, stl, blk, tov, pf, astTovRatio }}
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
										{#if position}
											<div class="text-xs font-small leading-5 text-gray-500">{position}</div>
										{/if}
									</div>
								</div>
							</td>

							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="text-sm leading-5 text-gray-500">
									{gamesPlayed ? gamesPlayed : '--'}
								</div>
							</td>

							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="text-sm leading-5 text-gray-500">{minutes ? minutes : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{pts ? pts : '--'}</div>
							</td>
							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{oreb ? oreb : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{dreb ? dreb : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{reb ? reb : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{ast ? ast : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{stl ? stl : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{blk ? blk : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{tov ? tov : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{pf ? pf : '--'}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">
									{astTovRatio ? astTovRatio.toFixed(2) : '--'}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
