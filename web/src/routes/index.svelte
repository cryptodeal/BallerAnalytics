<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import BallerAnalytics from '$lib/ux/animations/logo/BallerAnalytics.svelte';
	import WordCloud from '$lib/ux/animations/logo/WordCloud.svelte';
	let isVisible = false;
	onMount(() => {
		isVisible = true;
	});
</script>

<div class="w-full min-h-screen bg-hero-circuit-board-blue-30">
	<div class="appContent">
		<div
			class="mt-10 w-full flex flex-wrap items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4 min-h-100)"
		>
			<div class="w-full">
				<BallerAnalytics {isVisible} />
			</div>
			<div class="md:w-1/2">
				<WordCloud {isVisible} />
			</div>
		</div>
	</div>
</div>
