<script lang="ts">
	import Triangle from '~icons/fluent/triangle-12-regular';
	import type { IColHeader, ISortBy } from '../types';
	export let sort = null,
		colHeaders: IColHeader[],
		sortBy: ISortBy = null;
</script>

{#each colHeaders as { title, subtext, key }, i}
	{#if sort && sortBy}
		<th
			on:click={sort(key)}
			class="px-2 py-3 text-base cursor-pointer font-medium leading-4 tracking-wider text-left uppercase border-b whitespace-nowrap border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
		>
			<div class="inline-flex items-center">
				{title}
				{#if subtext}
					<div class="text-xs">{subtext}</div>
				{/if}
				{#if sortBy && sortBy.col === key}
					{#if sortBy.ascending}
						<Triangle class="stroke-current" />
					{:else}
						<Triangle class="stroke-current" style="transform:rotate(180deg);" />
					{/if}
				{/if}
			</div>
		</th>
	{:else}
		<th
			class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left uppercase border-b whitespace-nowrap border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
		>
			<div class="inline-flex items-center">
				{title}
				{#if subtext}
					<div class="text-xs">{subtext}</div>
				{/if}
			</div>
		</th>
	{/if}
{/each}
