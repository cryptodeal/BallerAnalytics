<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import Worker from '$lib/functions/_worker/loader?worker';
	import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/env';
	//import { MTLLoader } from '$lib/functions/_worker/core/MTLLoader';
	import type { WorkerLoaderMessageEvent } from '$lib/functions/_worker/core/types';
	import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
	import { isWorkerLoaderMessageEventData } from '$lib/functions/_worker/core/utils';

	import { mtl, extRefHelpers } from '$models/Basketball_size6_SF.mtl';
	import obj from '$models/Basketball_size6_SF.obj';

	//import { isWorkerLoaderMessage } from '$lib/functions/_worker/core/utils';
	export let height = 0,
		width = 0;

	let basketball: THREE.Object3D,
		clock = new THREE.Clock(),
		time = 0,
		delta = 0,
		ballYRotation = 0;

	if (browser) {
		const worker = new Worker();
		const encoder = new TextEncoder();
		const encodedMtl = encoder.encode(mtl);
		const encodedObj = encoder.encode(obj);
		worker.postMessage({ mtl: encodedMtl, obj: encodedObj, extRefHelpers }, [
			encodedMtl.buffer,
			encodedObj.buffer
		]);
		worker.onmessage = (event: WorkerLoaderMessageEvent /* | MTLWorkerMessageEvent */) => {
			const { data } = event;
			console.log(data);
			if (isWorkerLoaderMessageEventData(data)) {
				const { loadedExtRef } = data;
				for (const key in loadedExtRef) {
					const { width, height, src } = loadedExtRef[key];
					const img = new Image(width, height);
					img.src = src;
				}
				const materials = new MTLLoader().parse(mtl, '');
				materials.preload();
				basketball = new OBJLoader().setMaterials(materials).parse(obj);
			}
			/*
      else {
				
        const { material: loadedMaterial, geometry: loadedGeometry } = data;
				material = restructureMaterial(loadedMaterial[0]) as THREE.Material;
				geometry = restructureGeometry(loadedGeometry);
        
				console.log(`failing isWorkerLoaderMessageEventData test in Basketball.svelte`);
			}
      */
		};
	}
	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * 1.5;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	{#if basketball?.children[0] instanceof THREE.Mesh}
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
				geometry={basketball.children[0].geometry}
				material={basketball.children[0].material}
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
