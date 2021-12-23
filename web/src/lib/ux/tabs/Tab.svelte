<script lang="ts">
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';
	export let primaryColor: string;
	export let secondaryColor: string;
	export let active = false;

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);
	registerTab(tab);
	$: $selectedTab === tab ? (active = true) : (active = false);
</script>

{#if active}
	<li class="-mb-px mr-1">
		<span
			class="inline-block uppercase border-l border-t border-r rounded-t py-2 px-4 font-semibold"
			style="color:{secondaryColor};border-color:{secondaryColor};background-color:{primaryColor};"
			on:click={() => selectTab(tab)}
		>
			<slot />
		</span>
	</li>
{:else}
	<li class="-mb-px mr-1">
		<button
			class="inline-block uppercase py-2 px-4 font-semibold"
			style="color:{secondaryColor};border-color:{secondaryColor};background-color:{primaryColor};"
			on:click={() => selectTab(tab)}
		>
			<slot />
		</button>
	</li>
{/if}
