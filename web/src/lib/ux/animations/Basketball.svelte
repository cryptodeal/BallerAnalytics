<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
	import { browser } from '$app/env';
	import treeMat from '$models/Basketball_size6_SF.mtl';
	import treeObj from '$models/Basketball_size6_SF.obj';
	export let height = 0,
		width = 0;
	let clock = new THREE.Clock();
	let time = 0;
	let delta = 0;
	let ballYRotation = 0;
	const loadMtl = () => {
		const material = new MTLLoader().parse(treeMat, 'mtlRef/');
		material.preload();
		return material;
	};
	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * 1.5;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	{#if !browser}
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
		{#await loadMtl()}
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
		{:then loadedMaterial}
			<SC.Canvas antialias alpha={true} background={null} {height} {width}>
				<SC.Primitive
					position={[0, 0, 0]}
					object={new OBJLoader().setMaterials(loadedMaterial).parse(treeObj)}
					rotation={[0, ballYRotation, 0]}
				/>
				<SC.PerspectiveCamera position={[10, 10, 10]} />
				<SC.AmbientLight intensity={0.6} />
				<SC.DirectionalLight
					intensity={0.6}
					position={[-2, 3, 2]}
					shadow={{ mapSize: [2048, 2048] }}
				/>
			</SC.Canvas>
		{/await}
	{/if}
</div>
