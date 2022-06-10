<script lang="ts">
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import { getAge } from '$lib/functions/helpers';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import { resolve } from '$lib/functions/helpers';
	import type { Player2StatsObject } from '@balleranalytics/nba-api-ts';
	import type { IColHeader, ISortBy } from '../types';
	export let roster: Player2StatsObject[], season: number;

	let sortBy: ISortBy = { col: 'name.full', ascending: true };

	$: if (season) sortBy = { col: 'name.full', ascending: true };

	const colHeaders: IColHeader[] = [
		{ title: 'Name', subtext: '* denotes player on 2-Way contract', key: 'name.full' },
		{ title: 'Pos', key: 'stats.0.position' },
		{ title: 'Age', key: 'birthDate' },
		{ title: 'Ht', key: 'height' },
		{ title: 'Wt', key: 'weight' },
		{ title: 'College', key: 'college' }
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
				return -1 * sortModifier;
			} else if (itemA && !itemB) {
				return 1 * sortModifier;
			} else {
				return 0;
			}
		};
		roster = roster.sort(sort);
	};
</script>

<Table>
	<THead slot="thead" {colHeaders} {sort} {sortBy} />
	<svelte:fragment slot="tbody">
		{#each roster as { birthDate, college, meta, stats: [{ twoWay, position, number }], name, height, weight }, i}
			{@const { avif, png, webp } = meta.images.headshot}
			{@const { feet, inches } = height}
			<tr>
				<!-- Display Player Name -->
				<td
					class="py-2 px-4 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 xl:px-6"
				>
					<div class="inline-flex items-center">
						<div class="flex-shrink-0 w-28 h-20">
							<Headshot {avif} {png} {webp} alt="{name.full} headshot" />
						</div>

						<div class="ml-2 w-auto">
							<div class="text-sm font-medium leading-5 text-gray-900 dark:text-light-200">
								{name.full}

								{#if twoWay}
									<span class="text-xs">*</span>
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
						{#if birthDate}
							{getAge(new Date(birthDate).toString())}
						{/if}
					</div>
				</td>

				<!-- Display Player Height -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if feet}
							{feet}-{#if inches}
								{inches}
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
						{#if weight}
							{weight}
						{/if}
					</div>
				</td>

				<!-- Display Player College -->
				<td
					class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100  md:px-4 xl:px-6"
				>
					<div class="text-sm font-bold leading-5">
						{#if college}
							{college}
						{/if}
					</div>
				</td>
			</tr>
		{/each}
	</svelte:fragment>
</Table>
