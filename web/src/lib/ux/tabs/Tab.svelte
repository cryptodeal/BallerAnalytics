<script lang="ts">
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';
	export let primaryColor: number[];
	export let secondaryColor: number[];
	export let active = false;

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);
	registerTab(tab);
	$: $selectedTab === tab ? (active = true) : (active = false);
</script>

{#if active}
	<li class="-mb-px mr-1">
		<span
			class="inline-block text-dark-600 dark:text-light-200 uppercase border-l backdrop-filter backdrop-blur-lg border-t border-r rounded-t py-2 px-4 font-semibold"
			style="border-color:rgba({secondaryColor[0]}, {secondaryColor[1]}, {secondaryColor[2]}, 1);background-color:rgba({primaryColor[0]}, {primaryColor[1]}, {primaryColor[2]}, .3);"
			on:click={() => selectTab(tab)}
		>
			<slot />
		</span>
	</li>
{:else}
	<li class="-mb-px mr-1">
		<button
			class="inline-block text-dark-600 dark:text-light-200 uppercase py-2 px-4 backdrop-filter backdrop-blur-lg font-semibold"
			style="border-color:rgba({secondaryColor[0]}, {secondaryColor[1]}, {secondaryColor[2]}, 1);background-color:rgba({primaryColor[0]}, {primaryColor[1]}, {primaryColor[2]}, .3);"
			on:click={() => selectTab(tab)}
		>
			<slot />
		</button>
	</li>
{/if}
