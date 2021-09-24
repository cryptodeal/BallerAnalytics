<script>
	import Headshot from '$lib/img/Headshot.svelte';
	import { getAge } from '$lib/_utils/helpers';
	export let players;
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
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Name</th
						>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Pos</th
						>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Age</th
						>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Ht</th
						>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							Wt</th
						>
						<th
							class="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50"
						>
							College</th
						>
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
					{#each players as { player, number, position }}
						<tr>
							<td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
								<div class="flex items-center">
									<div class="flex-shrink-0 w-10 h-10">
										<Headshot
											src="https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/{player._id}.png"
											alt="{player.name.fullName} headshot"
										/>
									</div>

									<div class="ml-4">
										<div class="text-sm font-medium leading-5 text-gray-900">
											{player.name.fullName}
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
								<div class="text-sm leading-5 text-gray-500">{getAge(player.birthdate)}</div>
							</td>

							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{player.height}</div>
							</td>
							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">{player.weight}</div>
							</td>
							<td
								class="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-no-wrap border-b border-gray-200"
							>
								<div class="text-sm leading-5 text-gray-500">
									{player.school ? player.school : '--'}
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
