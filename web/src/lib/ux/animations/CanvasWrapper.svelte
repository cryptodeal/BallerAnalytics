<script lang="ts">
	import { onMount } from 'svelte';
	let canvas: HTMLCanvasElement,
		worker: Worker,
		height: number,
		width: number,
		canvasVisible = true;

	/*
  $: if (worker) {
		handleResize = (e) => {
			const { width, height, left, top } = canvas.getBoundingClientRect();

			const data = {
				type: 'size',
				left: left,
				top: top,
				width: width,
				height: height
			};
			worker.postMessage({
				type: 'event',
				id: 0,
				data
			});
		};
	}*/

	onMount(async () => {
		if ('transferControlToOffscreen' in canvas) {
			const Worker = (await import('../../functions/_worker/core/offscreen/dev/worker?worker'))
				.default;
			const startWorker = (await import('../../functions/_worker/core/offscreen/dev/scene'))
				.startWorker;
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
