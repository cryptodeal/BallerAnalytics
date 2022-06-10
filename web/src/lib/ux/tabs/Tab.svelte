<script lang="ts">
	import { invertColor } from '$lib/functions/helpers';
	import tinyColor from 'tinycolor2';
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';
	import darkMode from '$lib/data/stores/theme';
	export let primaryColor: string;
	export let secondaryColor: string;
	export let active = false;

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);
	registerTab(tab);
	$: $selectedTab === tab ? (active = true) : (active = false);
	$: textColor = invertColor(primaryColor, true);
	$: hoverColor = $darkMode
		? tinyColor(textColor).darken(40).toHexString()
		: tinyColor(textColor).lighten(40).toHexString();
</script>

{#if active}
	<li class="-mb-px mr-1">
		<span
			class="tabItem inline-block uppercase border-l backdrop-filter backdrop-blur-lg border-t border-r rounded-t py-2 px-4 font-semibold"
			style:--borderColor={secondaryColor}
			style:--bgColor={primaryColor}
			style:--textHover={hoverColor}
			style:--textColor={textColor}
			on:click={() => selectTab(tab)}
		>
			<slot />
		</span>
	</li>
{:else}
	<li class="-mb-px mr-1">
		<button
			class="tabItem inline-block uppercase py-2 px-4 backdrop-filter backdrop-blur-lg font-semibold"
			style:--borderColor={secondaryColor}
			style:--bgColor={primaryColor}
			style:--textHover={hoverColor}
			style:--textColor={textColor}
			on:click={() => selectTab(tab)}
		>
			<slot />
		</button>
	</li>
{/if}

<style lang="postcss">
	.tabItem {
		border-color: var(--borderColor);
		background-color: var(--bgColor);
		color: var(--textColor);
	}

	.tabItem:hover {
		color: var(--textHover);
	}
</style>
