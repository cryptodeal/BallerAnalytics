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
			<tr class="hover">
				<!-- Display Player Name -->
				<td>
					<div class="flex items-center space-x-3">
						<div class="avatar">
							<div class="mask mask-squircle w-12 h-12">
								<Headshot {avif} {png} {webp} alt="{name.full} headshot" />
							</div>
						</div>
						<div>
							<div class="font-bold">{name.full}</div>
							{#if twoWay}
								<div class="text-sm opacity-50">*</div>
							{/if}
							{#if number}
								<div class="text-sm opacity-50">{number}</div>
							{/if}
						</div>
					</div>
				</td>

				<!-- Display Player Position (POS) -->
				<td>
					{#if position}
						{position}
					{/if}
				</td>

				<!-- Display Player Age -->
				<td>
					{#if birthDate}
						{getAge(new Date(birthDate).toString())}
					{/if}
				</td>

				<!-- Display Player Height -->
				<td>
					{#if feet}
						{feet}-{#if inches}
							{inches}
						{:else}
							0
						{/if}
					{/if}
				</td>

				<!-- Display Player Weight -->
				<td>
					{#if weight}
						{weight}
					{/if}
				</td>

				<!-- Display Player College -->
				<td>
					{#if college}
						{college}
					{/if}
				</td>
			</tr>
		{/each}
	</svelte:fragment>
</Table>
