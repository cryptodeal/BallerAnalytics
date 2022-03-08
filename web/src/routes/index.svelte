<script lang="ts">
	import { onMount } from 'svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import BallerAnalytics from '$lib/ux/animations/logo/BallerAnalytics.svelte';
	import WordCloud from '$lib/ux/animations/logo/WordCloud.svelte';
	import CanvasWrapper from '$lib/ux/animations/Basketball.svelte';
	let isVisible = false;
	onMount(() => {
		isVisible = true;
	});
</script>

<MetaTags
	title="Baller Analytics: Fan Driven Basketball Analytics"
	description="Providing NBA, ABA, and BAA historical and current statistics, analytics, and information and leveraging Artificial Intelligence to provide unique advanced insight into fantasy basketball management."
/>

<div class="w-full min-h-screen bg-hero-circuit-board-blue-30">
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
					<div class="h-full w-full">
						<CanvasWrapper />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
