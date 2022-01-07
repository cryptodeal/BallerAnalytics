<script lang="ts">
	type LinkInfo = { title: string };
	export let links: LinkInfo[];
	export let primaryColor: number[];
	export let color1: string;
	export let secondaryColor: number[];
	import Tab from '$lib/ux/tabs/Tab.svelte';
</script>

<!-- {JSON.stringify($page, null, '  ')} -->

<!-- {JSON.stringify($navigating, null, '  ')} -->

<ul
	class="flex m-1 border-b"
	style="border-bottom-color:rgb({secondaryColor[0]}, {secondaryColor[1]}, {secondaryColor[2]})"
>
	{#each links as link}
		<Tab {primaryColor} {secondaryColor} {color1}>
			{link.title}
		</Tab>
	{/each}
</ul>
