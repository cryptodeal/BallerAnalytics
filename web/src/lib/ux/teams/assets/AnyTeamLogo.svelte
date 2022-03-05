<script lang="ts">
	import type { MetaGlobImport } from '$lib/types';
	export let logoModules: MetaGlobImport,
		slug: string,
		isTicker = false,
		size: string | number = 200;
</script>

{#if logoModules}
	{#each Object.entries(logoModules) as [key, { default: Logo }]}
		{#if key.includes(`logo-${slug}.svelte`)}
			<div class="inline-block">
				<Logo {size} {isTicker} />
			</div>
		{/if}
	{/each}
{/if}
