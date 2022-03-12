<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { getAge } from '$lib/functions/helpers';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import { resolve } from '$lib/functions/helpers';
	import type { PlayerRosterItem } from '$lib/types';
	import type { IColHeader, ISortBy } from '../types';
	export let roster: PlayerRosterItem[], season: number;

	let sortBy: ISortBy = { col: 'player.name.full', ascending: true };

	$: if (season) sortBy = { col: 'player.name.full', ascending: true };

	const colHeaders: IColHeader[] = [
		{ title: 'Name', subtext: '* denotes player on 2-Way contract', key: 'player.name.full' },
		{ title: 'Pos', key: 'position' },
		{ title: 'Age', key: 'player.birthDate' },
		{ title: 'Ht', key: 'player.height' },
		{ title: 'Wt', key: 'player.weight' },
		{ title: 'College', key: 'player.college' }
	];

	$: sort = (column: string) => {
		if (sortBy.col == column) {
			sortBy.ascending = !sortBy.ascending;
		} else {
			sortBy.col = column;
			sortBy.ascending = true;
		}
		// Modifier to sorting function for ascending or descending
		let sortModifier = sortBy.ascending ? 1 : -1;
		let sort = (a, b) => {
			let itemA = resolve(column, a);
			let itemB = resolve(column, b);
			if (column.includes('height') && itemA) {
				const { feet, inches } = itemA;
				itemA = feet * 12 + inches;
			}
			if (column.includes('height') && itemB) {
				const { feet, inches } = itemB;
				itemB = feet * 12 + inches;
			}
			if (itemA && itemB) {
				return itemA < itemB ? -1 * sortModifier : itemA > itemB ? 1 * sortModifier : 0;
			} else if (!itemA && itemB) {
				return 1 * sortModifier;
			} else {
				return -1 * sortModifier;
			}
		};
		roster = roster.sort(sort);
	};
</script>

<Table>
	<THead slot="thead" {colHeaders} {sort} {sortBy} />
	<svelte:fragment slot="tbody">
		{#each roster as { player, number, position, twoWay }, i}
			<tr>
				<!-- Display Player Name -->
				<td
					class="w-full py-2 px-4 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 xl:px-6"
				>
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
				<td
					class="w-auto px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if position}
							{position}
						{/if}
					</div>
				</td>

				<!-- Display Player Age -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player}
							{getAge(new Date(player.birthDate).toString())}
						{/if}
					</div>
				</td>

				<!-- Display Player Height -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
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
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if player.weight}
							{player.weight}
						{/if}
					</div>
				</td>

				<!-- Display Player College -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
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
