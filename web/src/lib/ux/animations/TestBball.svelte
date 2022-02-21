<script lang="ts">
	import { browser } from '$app/env';
	import Worker from '$lib/functions/_worker/testWorker?worker';
	import { mtl } from '$models/lowpoly_bball.mtl';
	import obj from '$models/lowpoly_bball.obj';
	import darkMode from '$lib/data/stores/theme';
	let canvas: HTMLCanvasElement,
		width: number,
		height: number,
		offscreen: OffscreenCanvas,
		canvasVisible = true,
		worker: Worker;
	$: if (canvas && !offscreen) {
		if (!worker) worker = new Worker();
		if ('transferControlToOffscreen' in canvas) {
			offscreen = canvas.transferControlToOffscreen();
			const worker = new Worker();
			const encoder = new TextEncoder();
			const encodedMtl = encoder.encode(mtl);
			const encodedObj = encoder.encode(obj);
			worker.postMessage(
				{
					mtl: encodedMtl,
					obj: encodedObj,
					drawingSurface: offscreen,
					darkMode: $darkMode.valueOf(),
					width,
					height,
					pixelRatio: window.devicePixelRatio
				},
				[offscreen, encodedMtl.buffer, encodedObj.buffer]
			);
		} else {
			canvasVisible = false;
		}
	}
	$: if (offscreen && width && height) {
		worker.postMessage({
			width,
			height,
			pixelRatio: window.devicePixelRatio,
			darkMode: $darkMode.valueOf()
		});
	}
</script>

<div class="basicContainer" bind:offsetHeight={height} bind:offsetWidth={width}>
	{#if browser}
		<canvas
			bind:this={canvas}
			class:hidden={!canvasVisible}
			{width}
			{height}
			style="width: {width}px; height: {height}px;"
		/>
	{/if}
</div>

<style>
	.hidden {
		display: none;
	}
</style>
