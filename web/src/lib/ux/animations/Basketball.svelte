<script lang="ts">
	import { Clock } from 'three';
	import AmbientLight from '$lib/svelte-cubed/lights/AmbientLight.svelte';
	import DirectionalLight from '$lib/svelte-cubed/lights/DirectionalLight.svelte';
	import Canvas from '$lib/svelte-cubed/Canvas.svelte';
	import { onFrame } from '$lib/svelte-cubed/utils/lifecycle';
	import OrbitControls from '$lib/svelte-cubed/controls/OrbitControls.svelte';
	import PerspectiveCamera from '$lib/svelte-cubed/cameras/PerspectiveCamera.svelte';
	import Primitive from '$lib/svelte-cubed/objects/Primitive.svelte';
	import basketball from '$models/basketball.glb?url';
	import darkMode from '$lib/data/stores/theme';
	import { browser } from '$app/env';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

	let canvasInfo,
		object,
		clock = new Clock(),
		time = 0,
		delta = 0,
		ballYRotation,
		width = 1,
		height = 1;

	$: if (canvasInfo && browser) {
		const ktx2Loader = new KTX2Loader().setTranscoderPath('/scripts/').detectSupport(canvasInfo());

		const loader = new GLTFLoader();
		loader.setKTX2Loader(ktx2Loader);

		loader.load(basketball, function (gltf) {
			//console.log(gltf);
			object = gltf.scene;
		});
	}

	onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * -1.2;
	});
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	<Canvas
		physicallyCorrectLights={true}
		bind:info={canvasInfo}
		antialias={true}
		precision={'highp'}
		alpha={true}
		background={null}
		{height}
		{width}
		failIfMajorPerformanceCaveat={true}
	>
		<PerspectiveCamera position={[0, 0, 3]} />

		<Primitive {object} rotation={[0.025, ballYRotation, 0.025]} />
		<AmbientLight intensity={$darkMode ? 1.4 : 2} />
		<OrbitControls enableZoom={false} enableDamping={true} dampingFactor={0.05} enablePan={false} />

		<DirectionalLight intensity={$darkMode ? 0.4 : 0.6} position={[-1, 4, 2]} />
	</Canvas>
</div>
