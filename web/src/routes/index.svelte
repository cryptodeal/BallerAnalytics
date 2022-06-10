<script lang="ts">
	import { onMount } from 'svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import BallerAnalytics from '$lib/ux/animations/logo/BallerAnalytics.svelte';
	import WordCloud from '$lib/ux/animations/logo/WordCloud.svelte';
	let Basketball;
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

<div class="w-full h-screen bg-hero-circuit-board">
	<div class="appContent w-full">
		<div
			class="mt-10 w-full flex flex-wrap items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
		>
			<div class="w-full p-2">
				<BallerAnalytics {isVisible} />
			</div>
			<div class="w-full mt-2 flex flex-wrap justify-center items-center">
				<div class="w-full flex justify-center md:(w-1/2 justify-end)">
					<WordCloud {isVisible} />
				</div>
				<div class="w-full flex justify-center h-40 md:(w-1/2 justify-start)">
					{#if Basketball}
						<svelte:component this={Basketball} />
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
