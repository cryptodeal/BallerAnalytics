<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
	import { browser } from '$app/env';
	import darkMode from '$lib/data/stores/theme';
	import { onMount } from 'svelte';
	import { mtl } from '$models/Basketball_size6_SF.mtl';
	import treeObj from '$models/Basketball_size6_SF.obj';
	export let height = 0,
		width = 0;
	let basketball: THREE.Group | undefined;
	let clock = new THREE.Clock();
	let time = 0;
	let delta = 0;
	let ballYRotation = 0;
	onMount(() => {
		const material = new MTLLoader().parse(mtl, '');
		material.preload();
		basketball = new OBJLoader().setMaterials(material).parse(treeObj);
	});
	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * 1.5;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	{#if (!browser && !(basketball?.children[0] instanceof THREE.Mesh)) || !(basketball?.children[0] instanceof THREE.Mesh)}
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
	{:else}
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
	{/if}
</div>
