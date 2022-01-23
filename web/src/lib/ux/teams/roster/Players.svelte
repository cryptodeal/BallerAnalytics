<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { getAge } from '$lib/functions/helpers';
	import type { PlayerRosterItem } from '$lib/types';
	export let roster: PlayerRosterItem[];
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
								class="px-2 py-3 text-base font-medium leading-4 whitespace-pre tracking-wider text-left uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								Name
								<div class="text-xs">(* denotes player on 2-Way contract)</div>
							</th>

							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								Pos
							</th>

							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left uppercase border-b border-gray-200  md:px-4 xl:px-6"
							>
								Age
							</th>

							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left whitespace-nowrap uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								Ht
							</th>

							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left whitespace-nowrap uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								Wt
							</th>

							<th
								class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left whitespace-nowrap uppercase border-b border-gray-200 md:px-4 xl:px-6"
							>
								College
							</th>
						</tr>
					</thead>
					<tbody class="text-black">
						{#each roster as { player, number, position, twoWay }, i}
							<tr>
								<!-- Display Player Name -->
								<td class="w-full py-2 px-4 whitespace-nowrap border-b border-gray-200 xl:px-6">
									<div class="flex w-full inline-flex items-center">
										<div class="flex-shrink-0 w-30 h-20">
											<Headshot
												avif={player.meta.images.headshot.avif}
												png={player.meta.images.headshot.png}
												webp={player.meta.images.headshot.webp}
												alt="{player.name.full} headshot"
											/>
										</div>

										<div class="ml-2 w-auto">
											<div class="text-sm font-medium leading-5 text-gray-900">
												{#if player}
													{player.name.full}
													{#if twoWay}
														<span class="text-xs">*</span>
													{/if}
												{/if}
											</div>
											{#if number}
												<div class="text-xs font-small leading-5 text-gray-700">{number}</div>
											{/if}
										</div>
									</div>
								</td>

								<!-- Display Player Position (POS) -->
								<td
									class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6"
								>
									<div class="text-sm font-bold leading-5">
										{#if position}
											{position}
										{/if}
									</div>
								</td>

								<!-- Display Player Age -->
								<td class="px-2 py-2 whitespace-nowrap border-b border-gray-200  md:px-4 xl:px-6">
									<div class="text-sm font-bold leading-5">
										{#if player}
											{getAge(new Date(player.birthDate).toString())}
										{/if}
									</div>
								</td>

								<!-- Display Player Height -->
								<td class="px-2 py-2 whitespace-nowrap border-b border-gray-200  md:px-4 xl:px-6">
									<div class="text-sm font-bold leading-5">
										{#if player.height.feet}
											{player.height.feet}-{#if player.height.inches}
												{player.height.inches}
											{:else}
												0
											{/if}
										{/if}
									</div>
								</td>

								<!-- Display Player Weight -->
								<td class="px-2 py-2 whitespace-nowrap border-b border-gray-200  md:px-4 xl:px-6">
									<div class="text-sm font-bold leading-5">
										{#if player.weight}
											{player.weight}
										{/if}
									</div>
								</td>

								<!-- Display Player College -->
								<td class="px-2 py-2 whitespace-nowrap border-b border-gray-200  md:px-4 xl:px-6">
									<div class="text-sm font-bold leading-5">
										{#if player.college}
											{player.college}
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
