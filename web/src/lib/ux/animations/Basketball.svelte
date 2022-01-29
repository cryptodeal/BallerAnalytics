<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
	import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
	import { onMount } from 'svelte';
	export let height: number;
	export let width: number;
	let basketballObj;

	onMount(() => {
		new MTLLoader()
			.setPath('/obj/basketball/')
			.load('Basketball_size6_SF.mtl', function (materials) {
				materials.preload();
				new OBJLoader()
					.setMaterials(materials)
					.setPath('/obj/basketball/')
					.load('Basketball_size6_SF.obj', function (object) {
						basketballObj = object;
					});
			});
	});
	let clock = new THREE.Clock();
	let time = 0;
	let delta = 0;
	let ballYRotation = 0;

	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * 1.5;
	});
</script>

<SC.Canvas antialias alpha={true} {height} {width}>
	{#if basketballObj}
		<SC.Mesh
			position={[0, -3.4, 0]}
			geometry={basketballObj.children[0].geometry}
			material={basketballObj.children[0].material}
			rotation={[0, ballYRotation, 0]}
		/>
	{/if}
	<SC.AmbientLight intensity={0.65} />
	<SC.DirectionalLight intensity={0.2} position={[2, 1, 0]} />
	<SC.PerspectiveCamera position={[0, 0, 10]} />
</SC.Canvas>
