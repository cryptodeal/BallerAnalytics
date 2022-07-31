<script lang="ts">
	import { Clock, Group, WebGLRenderer } from 'three';
	import {
		AmbientLight,
		Canvas,
		DirectionalLight,
		onFrame,
		OrbitControls,
		PerspectiveCamera,
		Primitive
	} from 'svelte-cubed';
	import basketball from '$models/test.glb?url';
	import darkMode from '$lib/data/stores/theme';
	import { onMount } from 'svelte';
	import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

	let object: Group,
		clock = new Clock(),
		time = 0,
		delta = 0,
		ballYRotation: number,
		width = 1,
		height = 1;

	onMount(async () => {
		const GLTFLoader = (await import('three/examples/jsm/loaders/GLTFLoader.js')).GLTFLoader;
		const KTX2Loader = (await import('three/examples/jsm/loaders/KTX2Loader.js')).KTX2Loader;
		loadGlb(GLTFLoader, KTX2Loader);
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function loadGlb(GLTFLoader: any, KTX2Loader: any) {
		const ktx2Loader = new KTX2Loader()
			.setTranscoderPath('/scripts/')
			.detectSupport(new WebGLRenderer());
		const loader = new GLTFLoader();
		loader.setKTX2Loader(ktx2Loader);
		loader.load(basketball, function (gltf: GLTF) {
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
		antialias={true}
		alpha={true}
		background={undefined}
		{height}
		{width}
		failIfMajorPerformanceCaveat={true}
	>
		<PerspectiveCamera position={[0, 0, 3]} />
		<Primitive {object} rotation={[0.025, ballYRotation, 0.025]} />
		<AmbientLight intensity={$darkMode ? 0.6 : 1} />
		<OrbitControls enableZoom={false} enableDamping={true} dampingFactor={0.05} enablePan={false} />
		<DirectionalLight intensity={$darkMode ? 0.4 : 0.6} position={[-1, 3, 2]} />
	</Canvas>
</div>
