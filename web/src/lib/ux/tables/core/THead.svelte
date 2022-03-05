<script lang="ts">
	import type { IColHeader } from '../types';

	export let colHeaders: IColHeader[];
</script>

{#each colHeaders as { title, subtext }, i}
	<th
		class="px-2 py-3 text-base font-medium leading-4 tracking-wider text-left uppercase border-b whitespace-nowrap border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
	>
		{title}
		{#if subtext}
			<div class="text-xs">{subtext}</div>
		{/if}
	</th>
{/each}
