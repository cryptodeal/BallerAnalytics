<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import Worker from '$lib/functions/_worker/loader?worker';
	import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/env';
	//import { MTLLoader } from '$lib/functions/_worker/core/MTLLoader';
	import type {
		WorkerLoaderMessageEvent,
		MainExtRefImageData,
		MTLWorkerMessageEvent
	} from '$lib/functions/_worker/core/types';
	import {
		restructureMaterial,
		restructureGeometry
	} from '$lib/functions/_worker/core/restructure';
	import { isWorkerLoaderMessageEventData } from '$lib/functions/_worker/core/utils';
	import { mtl, extRefHelpers } from '$models/Basketball_size6_SF.mtl';
	import obj from '$models/Basketball_size6_SF.obj';

	//import { isWorkerLoaderMessage } from '$lib/functions/_worker/core/utils';
	export let height = 0,
		width = 0;

	let material: THREE.Material,
		geometry: THREE.BufferGeometry,
		clock = new THREE.Clock(),
		time = 0,
		delta = 0,
		ballYRotation = 0;
	$: console.log(material);
	$: console.log(geometry);
	if (browser) {
		const worker = new Worker();
		const encoder = new TextEncoder();
		const encodedMtl = encoder.encode(mtl);
		const encodedObj = encoder.encode(obj);
		worker.postMessage({ mtl: encodedMtl, obj: encodedObj, extRefHelpers }, [
			encodedMtl.buffer,
			encodedObj.buffer
		]);
		worker.onmessage = (event: WorkerLoaderMessageEvent | MTLWorkerMessageEvent) => {
			const { data } = event;
			console.log(`main thread received message: `, data);
			if (isWorkerLoaderMessageEventData(data)) {
				console.log(`isWorkerLoaderMessageEventData: true`);
				const { loadedExtRef } = data;
				for (const key in loadedExtRef) {
					const { width, height, src } = loadedExtRef[key];
					const img = new Image(width, height);
					img.onload = function (e: Event) {
						const canvas = document.createElement('canvas');
						canvas.width = img.width;
						canvas.height = img.height;
						const ctx = canvas.getContext('2d');
						ctx.drawImage(img, 0, 0, img.width, img.height);
						const imageData = ctx.getImageData(0, 0, img.width, img.height);
						console.log(imageData);
						const imageMessage: MainExtRefImageData = { imageData, width, height, src };
						worker.postMessage(imageMessage, [imageData.data.buffer]);
						canvas.remove();
					};
					img.src = src;
				}
			} else {
				console.log(`isWorkerLoaderMessageEventData: false`);
				const { material: loadedMaterial, geometry: loadedGeometry } = data;
				const materialUsed = Array.isArray(loadedMaterial) ? loadedMaterial[0] : loadedMaterial;
				material = restructureMaterial(materialUsed) as THREE.Material;
				geometry = restructureGeometry(loadedGeometry);
			}
		};
	}
	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * 1.5;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	{#if geometry instanceof THREE.BufferGeometry && material instanceof THREE.Material}
		<SC.Canvas
			antialias
			alpha={true}
			background={null}
			{height}
			{width}
			failIfMajorPerformanceCaveat={true}
		>
			<SC.Mesh
				position={[0, -5, 0]}
				scale={1.5}
				{geometry}
				{material}
				rotation={[0, ballYRotation, 0]}
			/>
			<SC.PerspectiveCamera position={[10, 10, 10]} />
			<SC.AmbientLight intensity={$darkMode ? 0.6 : 0.8} />
			<SC.DirectionalLight intensity={0.2} position={[-2, 3, 2]} />
		</SC.Canvas>
	{:else}
		<div class="loadingContainer">
			<div class="wave" />
			<div class="wave" />
			<div class="wave" />
			<div class="wave" />
			<div class="wave" />
			<div class="wave" />
			<div class="wave" />
			<div class="wave" />
			<div class="wave" />
			<div class="wave" />
		</div>
	{/if}
</div>
