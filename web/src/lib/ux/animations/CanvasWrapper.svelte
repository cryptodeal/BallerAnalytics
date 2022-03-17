<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import darkMode from '$lib/data/stores/theme';
	import { OrbitControlsProxy } from '$lib/functions/_worker/core/offscreen/orbitControlsProxy';
	let canvas: HTMLCanvasElement,
		offscreen: OffscreenCanvas,
		canvasVisible = true,
		worker: Worker,
		height: number,
		width: number,
		controlsProxy: OrbitControlsProxy;

	onMount(async () => {
		if ('transferControlToOffscreen' in canvas) {
			const Worker = (await import('../../functions/_worker/testWorker?worker')).default;
			offscreen = canvas.transferControlToOffscreen();
			worker = new Worker();
			controlsProxy = new OrbitControlsProxy(worker, canvas);
			controlsProxy.initScene(
				offscreen,
				width,
				height,
				window.devicePixelRatio,
				$darkMode.valueOf()
			);
		} else canvasVisible = false;
	});

	$: if (offscreen && worker && (width || height || $darkMode)) {
		controlsProxy.restyle(height, width, $darkMode.valueOf());
	}
</script>

<div class="basicContainer">
	{#if browser && canvasVisible}
		<div class="w-full h-full" bind:offsetHeight={height} bind:offsetWidth={width}>
			<canvas
				bind:this={canvas}
				on:pointerdown|capture|nonpassive={controlsProxy.handlePointerDown}
				on:keydown|capture|nonpassive={controlsProxy.handleKeyboardEvent}
				on:wheel|capture|nonpassive={controlsProxy.handleWheelEvent}
				on:keyup|capture|nonpassive={controlsProxy.handleKeyboardEvent}
				on:touchstart|capture|nonpassive={controlsProxy.handleTouchEvent}
				on:touchmove|capture|nonpassive={controlsProxy.handleTouchEvent}
				on:touchend|capture|nonpassive={controlsProxy.handleTouchEvent}
				on:mousemove|capture|nonpassive={controlsProxy.handleMouseMove}
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
