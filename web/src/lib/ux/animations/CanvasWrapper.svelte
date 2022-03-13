<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import darkMode from '$lib/data/stores/theme';
	let canvas: HTMLCanvasElement,
		offscreen: OffscreenCanvas,
		workerControl = false,
		canvasVisible = true,
		worker: Worker,
		height: number,
		width: number,
		sendMouse;

	function getCanvasRelativePosition(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	function setPickPosition(event) {
		const pos = getCanvasRelativePosition(event);
		sendMouse((pos.x / canvas.clientWidth) * 2 - 1, (pos.y / canvas.clientHeight) * -2 + 1); // note we flip Y
	}
	function clearPickPosition() {
		sendMouse(-100000, -100000);
	}

	onMount(async () => {
		if ('transferControlToOffscreen' in canvas) {
			const Worker = (await import('../../functions/_worker/testWorker?worker')).default;
			offscreen = canvas.transferControlToOffscreen();
			worker = new Worker();
		} else canvasVisible = false;
	});

	$: if (offscreen && worker && (width || height || $darkMode)) {
		if (!workerControl) {
			sendMouse = (x, y) => {
				worker.postMessage({
					type: 'mouse',
					x,
					y
				});
			};
			workerControl = true;
			worker.postMessage(
				{
					type: 'init',
					drawingSurface: offscreen,
					width,
					darkMode: $darkMode.valueOf(),
					height,
					pixelRatio: window.devicePixelRatio
				},
				[offscreen]
			);
		} else worker.postMessage({ type: 'style', width, height, darkMode: $darkMode.valueOf() });
	}
</script>

<div class="basicContainer">
	{#if browser && canvasVisible}
		<div class="w-full h-full" bind:offsetHeight={height} bind:offsetWidth={width}>
			<canvas
				bind:this={canvas}
				on:mousemove={setPickPosition}
				on:mouseout={clearPickPosition}
				on:mouseleave={clearPickPosition}
				on:blur={clearPickPosition}
				class:hidden={!canvasVisible}
				{width}
				{height}
				style="width:{width}px;height:{height}px;"
			/>
		</div>
	{:else}
		{#await import('./Basketball.svelte') then Ball}
			<svelte:component this={Ball.default} />
		{/await}
	{/if}
</div>
