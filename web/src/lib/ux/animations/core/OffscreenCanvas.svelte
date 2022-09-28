<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Worker from '$lib/functions/_worker/testWorker?worker';
	import { mtl } from '$models/Basketball_size6_SF.mtl';
	import obj from '$models/Basketball_size6_SF.obj';
	let canvas: HTMLCanvasElement, width: number, height: number, offscreen: OffscreenCanvas;
	$: if (browser && canvas) offscreen = canvas.transferControlToOffscreen();
	onMount(() => {
		const worker = new Worker();
		const encoder = new TextEncoder();
		const encodedMtl = encoder.encode(mtl);
		const encodedObj = encoder.encode(obj);
		worker.postMessage(
			{
				mtl: encodedMtl,
				obj: encodedObj,
				drawingSurface: offscreen,
				width,
				height,
				pixelRatio: window.devicePixelRatio
			},
			[offscreen, encodedMtl.buffer, encodedObj.buffer]
		);
	});
</script>

<div class="basicContainer" bind:offsetHeight={height} bind:offsetWidth={width}>
	{#if browser}
		<canvas bind:this={canvas} {width} {height} style="width: {width}px; height: {height}px;" />
	{/if}
</div>
