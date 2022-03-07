<script lang="ts">
	import { Clock, Group } from 'three';
	import {
		Canvas,
		AmbientLight,
		DirectionalLight,
		onFrame,
		OrbitControls,
		PerspectiveCamera,
		Primitive
	} from 'svelte-cubed';
	import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/env';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

	let object: Group,
		clock = new Clock(),
		width = 0,
		height = 0,
		time = 0,
		delta = 0,
		ballYRotation;

	$: if (browser) {
		const loader = new GLTFLoader();
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('/');

		loader.setDRACOLoader(dracoLoader);
		loader.load('models/bball/scene.gltf', function (gltf) {
			//console.log(gltf);
			object = gltf.scene;
		});
	}

	onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * 2;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	<Canvas
		antialias
		physicallyCorrectLights={true}
		alpha={true}
		background={null}
		{height}
		{width}
		failIfMajorPerformanceCaveat={true}
	>
		<PerspectiveCamera position={[0, 0, 2.5]} fov={50} />

		<Primitive {object} rotation={[0.025, ballYRotation, 0.025]} />
		<AmbientLight intensity={$darkMode ? 1.4 : 2} />
		<OrbitControls enableZoom={false} enableDamping={true} dampingFactor={0.02} />

		<DirectionalLight intensity={$darkMode ? 0.4 : 0.6} position={[-1, 4, 2]} />
	</Canvas>
</div>
