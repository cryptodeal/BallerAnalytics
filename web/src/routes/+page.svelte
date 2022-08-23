<script lang="ts">
	import { onMount, SvelteComponent } from 'svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import BallerAnalytics from '$lib/ux/animations/logo/BallerAnalytics.svelte';
	import WordCloud from '$lib/ux/animations/logo/WordCloud.svelte';
	let Basketball: typeof SvelteComponent;
	let isVisible = false;
	onMount(async () => {
		isVisible = true;
		Basketball = (await import('../lib/ux/animations/CanvasWrapper.svelte')).default;
	});
</script>

<MetaTags
	title="Baller Analytics: Fan Driven Basketball Analytics"
	description="Providing NBA, ABA, and BAA historical and current statistics, analytics, and information and leveraging Artificial Intelligence to provide unique advanced insight into fantasy basketball management."
/>

<div
	class="w-full flex flex-wrap items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:w-3/4 md:p-4 2xl:w-1/2"
>
	<div class="w-full p-2">
		<BallerAnalytics {isVisible} />
	</div>
	<div class="w-full mt-2 flex flex-wrap justify-center items-center">
		<div class="w-full flex justify-center md:w-1/2 md:justify-end">
			<WordCloud {isVisible} />
		</div>
		<div class="w-full flex justify-center h-40 md:w-1/2 md:justify-start">
			{#if Basketball}
				<svelte:component this={Basketball} />
			{/if}
		</div>
	</div>
</div>
