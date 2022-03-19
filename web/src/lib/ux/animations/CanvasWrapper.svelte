<script lang="ts">
	import { onMount } from 'svelte';
	import { startWorker } from '$lib/functions/_worker/core/offscreen/dev/scene';
	let canvas: HTMLCanvasElement,
		worker: Worker,
		height: number,
		width: number,
		canvasVisible = true;

	onMount(async () => {
		if ('transferControlToOffscreen' in canvas) {
			const Worker = (await import('../../functions/_worker/core/offscreen/dev/worker?worker'))
				.default;
			worker = new Worker();
			startWorker(canvas, worker, window.devicePixelRatio);
		} else canvasVisible = false;
	});
</script>

<div class="basicContainer" bind:offsetHeight={height} bind:offsetWidth={width}>
	{#if canvasVisible}
		<canvas bind:this={canvas} {width} {height} style="width:{width}px;height:{height}px;" />
	{:else}
		{#await import('./Basketball.svelte') then Ball}
			<svelte:component this={Ball.default} />
		{/await}
	{/if}
</div>
