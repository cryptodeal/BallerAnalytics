<script lang="ts">
	type LinkInfo = { title: string };
	export let links: LinkInfo[];
	export let primaryColor: string;
	export let secondaryColor: string;
	import Tab from '$lib/ux/tabs/Tab.svelte';
</script>

<!-- {JSON.stringify($page, null, '  ')} -->

<!-- {JSON.stringify($navigating, null, '  ')} -->

<ul class="flex m-1 border-b" style="border-bottom-color:{secondaryColor}">
	{#each links as link}
		<Tab {primaryColor} {secondaryColor}>
			{link.title}
		</Tab>
	{/each}
</ul>
