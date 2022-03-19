<script lang="ts">
	import { onMount } from 'svelte';
	let canvas: HTMLCanvasElement,
		worker: Worker,
		height: number,
		width: number,
		canvasVisible = true;

	onMount(async () => {
		if ('transferControlToOffscreen' in canvas) {
			const [workerImport, startWorkerImport] = await Promise.all([
				import('../../functions/_worker/core/offscreen/dev/worker?worker'),
				import('../../functions/_worker/core/offscreen/dev/scene')
			]);
			const { default: Worker } = workerImport;
			const { startWorker } = startWorkerImport;
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
