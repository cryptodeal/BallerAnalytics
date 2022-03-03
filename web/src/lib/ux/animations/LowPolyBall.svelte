<script lang="ts">
	import { Clock, Mesh as threeMesh } from 'three';
	import {
		onFrame,
		Canvas,
		Mesh,
		PerspectiveCamera,
		AmbientLight,
		DirectionalLight,
		OrbitControls
	} from 'svelte-cubed';
	import { browser } from '$app/env';
	import Worker from '$lib/functions/_worker/testWorker?worker';
	import { mtl } from '$models/lowpoly_bball.mtl';
	import obj from '$models/lowpoly_bball.obj';
	import darkMode from '$lib/data/stores/theme';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
	import { MTLLoader } from '$lib/functions/_worker/core/TestLoader';
	import type { MTLLoader as threeMtlLoader } from 'three/examples/jsm/loaders/MTLLoader';

	let canvas: HTMLCanvasElement,
		width: number,
		height: number,
		offscreen: OffscreenCanvas,
		canvasVisible = true,
		worker: Worker,
		encoder: TextEncoder,
		encodedMtl: Uint8Array,
		encodedObj: Uint8Array,
		object,
		clock = new Clock(),
		time = 0,
		delta = 0,
		ballYRotation = 0;

	$: if (browser && !canvasVisible) {
		const materials = new MTLLoader().parse(mtl) as unknown as threeMtlLoader.MaterialCreator;
		materials.preload();
		object = new OBJLoader().setMaterials(materials).parse(obj);
	} else if (canvas && !offscreen) {
		/* create worker if one doesn't already created */
		if (!worker) worker = new Worker();
		if ('transferControlToOffscreen' in canvas) {
			/* create encoder if one doesn't already created */
			if (!encoder) encoder = new TextEncoder();
			offscreen = canvas.transferControlToOffscreen();
			if (!encodedMtl) encodedMtl = encoder.encode(mtl);
			if (!encodedObj) encodedObj = encoder.encode(obj);
			worker.postMessage(
				{
					mtl: encodedMtl,
					obj: encodedObj,
					drawingSurface: offscreen,
					width,
					darkMode: $darkMode.valueOf(),
					height,
					pixelRatio: window.devicePixelRatio
				},
				[offscreen, encodedMtl.buffer, encodedObj.buffer]
			);
		} else canvasVisible = false;
	}
	$: if (offscreen && worker && (width || height || $darkMode)) {
		worker.postMessage({ width, height, darkMode: $darkMode.valueOf() });
	}
	onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * -0.8;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	{#if browser && canvasVisible}
		<canvas
			bind:this={canvas}
			class:hidden={!canvasVisible}
			{width}
			{height}
			style="width:{width}px;height:{height}px;"
		/>
	{:else}
		<Canvas
			antialias
			alpha={true}
			background={null}
			{height}
			{width}
			failIfMajorPerformanceCaveat={true}
		>
			{#if object?.children[0] instanceof threeMesh}
				<Mesh
					position={[0, 0, 0]}
					geometry={object.children[0].geometry}
					scale={20}
					material={object.children[0].material}
					rotation={[0, ballYRotation, 0]}
				/>
			{/if}
			<PerspectiveCamera position={[0, 0, 20]} />
			<AmbientLight intensity={$darkMode ? 1.7 : 2.3} />
			<OrbitControls enableZoom={false} />
			<DirectionalLight intensity={$darkMode ? 0.5 : 0.6} position={[-4, 4.7, 0]} />
		</Canvas>
	{/if}
</div>

<style>
	.hidden {
		display: none;
	}
</style>
