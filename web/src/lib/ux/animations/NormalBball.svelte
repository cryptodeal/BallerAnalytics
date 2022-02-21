<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	// import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/env';
	import { MTLLoader } from '$lib/functions/_worker/core/TestLoader';
	import { mtl } from '$models/lowpoly_bball.mtl';
	import darkMode from '$lib/data/stores/theme';
	import obj from '$models/lowpoly_bball.obj';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
	import type { MTLLoader as threeMTL } from 'three/examples/jsm/loaders/MTLLoader';

	export let height = 0,
		width = 0;

	let object,
		clock = new THREE.Clock(),
		time = 0,
		delta = 0,
		ballYRotation = 0,
		info;
	$: if (info) console.log(info());

	if (browser) {
		const material = new MTLLoader().parse(mtl) as unknown as threeMTL.MaterialCreator;
		material.preload();
		object = new OBJLoader().setMaterials(material).parse(obj);
	}
	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * 1.5;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	{#if object?.children[0] instanceof THREE.Mesh}
		<SC.Canvas
			antialias
			bind:info
			alpha={true}
			background={null}
			{height}
			{width}
			failIfMajorPerformanceCaveat={true}
		>
			<SC.Mesh
				position={[0, 0, 0]}
				geometry={object.children[0].geometry}
				material={object.children[0].material}
				rotation={[0, ballYRotation, 0]}
			/>
			<SC.PerspectiveCamera position={[0, 0, 2]} />
			<SC.AmbientLight intensity={$darkMode ? 1.4 : 2} />
			<SC.DirectionalLight intensity={$darkMode ? 0.4 : 0.6} position={[-4, 4, 2]} />
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
