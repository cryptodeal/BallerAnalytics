<script lang="ts">
	import { Clock, WebGLRenderer } from 'three';
	import type { Group } from 'three';
	import {
		AmbientLight,
		DirectionalLight,
		onFrame,
		OrbitControls,
		PerspectiveCamera,
		Primitive
	} from 'svelte-cubed';
	import basketball from '$models/basketball.glb?url';
	import darkMode from '$lib/data/stores/theme';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
	import { onMount } from 'svelte';

	let object: Group,
		clock = new Clock(),
		time = 0,
		delta = 0,
		ballYRotation;

	onMount(() => {
		const ktx2Loader = new KTX2Loader()
			.setTranscoderPath('/scripts/')
			.detectSupport(new WebGLRenderer());

		const loader = new GLTFLoader();
		loader.setKTX2Loader(ktx2Loader);

		loader.load(basketball, function (gltf) {
			//console.log(gltf);
			object = gltf.scene;
		});
	});

	onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballYRotation = time * -1.2;
	});
</script>

<PerspectiveCamera position={[0, 0, 3]} />

<Primitive {object} rotation={[0.025, ballYRotation, 0.025]} />
<AmbientLight intensity={$darkMode ? 1.4 : 2} />
<OrbitControls enableZoom={false} enableDamping={true} dampingFactor={0.05} enablePan={false} />

<DirectionalLight intensity={$darkMode ? 0.4 : 0.6} position={[-1, 4, 2]} />
