<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { getAge } from '$lib/functions/helpers';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import type { PlayerRosterItem } from '$lib/types';
	import type { IColHeader } from '../types';
	export let roster: PlayerRosterItem[];

	const colHeaders: IColHeader[] = [
		{ title: 'Name', subtext: '* denotes player on 2-Way contract' },
		{ title: 'Pos' },
		{ title: 'Age' },
		{ title: 'Ht' },
		{ title: 'Wt' },
		{ title: 'College' }
	];
</script>

<Table>
	<THead slot="thead" {colHeaders} />
	<svelte:fragment slot="tbody">
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
							<div class="text-sm font-medium leading-5 text-gray-900 dark:text-light-200">
								{#if player}
									{player.name.full}
									{#if twoWay}
										<span class="text-xs">*</span>
									{/if}
								{/if}
							</div>
							{#if number}
								<div class="text-xs font-small leading-5 text-gray-700 dark:text-gray-300">
									{number}
								</div>
							{/if}
						</div>
					</div>
				</td>

				<!-- Display Player Position (POS) -->
				<td class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 md:px-4 xl:px-6">
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
	</svelte:fragment>
</Table>
