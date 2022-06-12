<script lang="ts">
	import type { IColHeader } from '../types';
	export let colHeaders: IColHeader[];
</script>

{#each colHeaders as { title, subtext, key }, i}
	<th>
		<div class="inline-flex items-center">
			<div>
				<div class="font-bold">{title}</div>
				{#if subtext}
					<div class="text-sm opacity-50">{subtext}</div>
				{/if}
			</div>
		</div>
	</th>
{/each}
