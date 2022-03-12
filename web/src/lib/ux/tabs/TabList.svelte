<script lang="ts">
	import darkMode from '$lib/data/stores/theme';
	import Tab from '$lib/ux/tabs/Tab.svelte';

	type LinkInfo = { title: string };
	export let links: LinkInfo[];
	export let primaryColor: number[] | string = $darkMode ? '#181818' : '#E5E7EB';
	export let secondaryColor: number[] | string = $darkMode ? '#E5E7EB' : '#181818';
</script>

<!-- {JSON.stringify($page, null, '  ')} -->

<!-- {JSON.stringify($navigating, null, '  ')} -->
<ul
	class="tabBorder flex m-1 border-b"
	style:--borderColor={Array.isArray(secondaryColor)
		? `rgb(${secondaryColor[0]}, ${secondaryColor[1]}, ${secondaryColor[2]})`
		: secondaryColor}
>
	{#each links as link}
		<Tab {primaryColor} {secondaryColor}>
			{link.title}
		</Tab>
	{/each}
</ul>

<style>
	.tabBorder {
		border-bottom-color: var(--borderColor);
	}
</style>
