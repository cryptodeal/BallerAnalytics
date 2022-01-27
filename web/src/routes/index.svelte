<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import BallerAnalytics from '$lib/ux/animations/logo/BallerAnalytics.svelte';
	import WordCloud from '$lib/ux/animations/logo/WordCloud.svelte';
	import Bball from '$lib/ux/animations/Basketball.svelte';
	let isVisible = false;
	let width = 1;
	let height = 1;
	onMount(() => {
		isVisible = true;
	});
</script>

<div class="w-full min-h-screen bg-hero-circuit-board-blue-30">
	<div class="appContent w-full">
		<div
			class="mt-10 w-full flex flex-wrap items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
		>
			<div class="w-full p-4">
				<BallerAnalytics {isVisible} />
			</div>
			<div class="w-full mt-2 flex flex-wrap justify-center items-center">
				<div class="flex justify-center md:(w-1/2 justify-end)">
					<div class="h-full w-full md:w-1/2">
						<WordCloud {isVisible} />
					</div>
				</div>
				<div class="w-screen flex justify-center h-40 md:(w-1/2 justify-start)">
					<div class="h-full w-full md:w-1/2" bind:clientHeight={height} bind:clientWidth={width}>
						<Bball {width} {height} />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
