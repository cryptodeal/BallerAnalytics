<script context="module" lang="ts">
	export const TABS = {};
</script>

<script lang="ts">
	import { setContext, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	const tabs: HTMLElement[] = [];
	const panels: HTMLElement[] = [];

	const selectedTab = writable<any>(null);
	const selectedPanel = writable<any>(null);

	setContext(TABS, {
		registerTab: (tab: any) => {
			tabs.push(tab);
			selectedTab.update((current) => current || tab);

			onDestroy(() => {
				const i = tabs.indexOf(tab);
				tabs.splice(i, 1);
				selectedTab.update((current) =>
					current === tab ? tabs[i] || tabs[tabs.length - 1] : current
				);
			});
		},

		registerPanel: (panel: any) => {
			panels.push(panel);
			selectedPanel.update((current) => current || panel);

			onDestroy(() => {
				const i = panels.indexOf(panel);
				panels.splice(i, 1);
				selectedPanel.update((current) =>
					current === panel ? panels[i] || panels[panels.length - 1] : current
				);
			});
		},

		selectTab: (tab: any) => {
			const i = tabs.indexOf(tab);
			selectedTab.set(tab);
			selectedPanel.set(panels[i]);
		},

		selectedTab,
		selectedPanel
	});
</script>

<div class="tabs">
	<slot />
</div>
