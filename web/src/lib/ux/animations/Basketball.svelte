<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import treeMat from '$models/Basketball_size6_SF.mtl';
	import treeObj from '$models/Basketball_size6_SF.obj';
	export let height = 0,
		width = 0;
	let basketball: THREE.Group | undefined;
	let clock = new THREE.Clock();
	let time = 0;
	let delta = 0;
	let ballYRotation = 0;
	const loadMtl = async () => {
		const material = await new MTLLoader().parse(treeMat, 'mtlRef/');
		await material.preload();
		return await new OBJLoader().setMaterials(material).parse(treeObj);
	};
	$: if (basketball) console.log(basketball);
	onMount(async () => {
		basketball = await loadMtl();
	});
	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * 1.5;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	{#if !browser || !(basketball?.children[0] instanceof THREE.Mesh) || !(basketball?.children[0] instanceof THREE.Mesh)}
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
		<SC.Canvas antialias alpha={true} background={null} {height} {width}>
			<SC.Mesh
				position={[0, 0, 0]}
				geometry={basketball.children[0].geometry}
				material={basketball.children[0].material}
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
	{/if}
</div>
