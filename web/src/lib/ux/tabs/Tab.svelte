<script lang="ts">
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';
	export let color;

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);

	registerTab(tab);
</script>

<button
	class:selected={$selectedTab === tab}
	class="mr-2 ml-0 my-0 font-medium"
	style="border-bottom-color:{color}"
	on:click={() => selectTab(tab)}
>
	<slot />
</button>

<style>
	button {
		background: none;
		border: none;
		border-radius: 0;
		outline: none;
		color: white;
	}

	.selected {
		border: none;
		border-bottom-style: solid;
		border-bottom-width: 2px;
		outline: none;
		color: white;
	}
</style>
