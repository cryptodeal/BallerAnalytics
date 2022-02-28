<script lang="ts">
	import type { MetaGlobImport } from '$lib/types';
	export let logoModules: MetaGlobImport, slug: string;
</script>

{#if logoModules}
	{#each Object.entries(logoModules) as [key, { default: Logo }]}
		{#if key.includes(`logo-${slug}.svelte`)}
			<Logo size={200} />
		{/if}
	{/each}
{/if}
