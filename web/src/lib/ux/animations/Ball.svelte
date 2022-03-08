<script lang="ts">
	import { Clock } from 'three';
	import { onMount } from 'svelte';
	import { onFrame } from '$lib/svelte-cubed/utils/lifecycle';
	import { get_root } from '$lib/svelte-cubed/context';
	import OrbitControls from '$lib/svelte-cubed/controls/OrbitControls.svelte';
	import PerspectiveCamera from '$lib/svelte-cubed/cameras/PerspectiveCamera.svelte';
	import AmbientLight from '$lib/svelte-cubed/lights/AmbientLight.svelte';
	import DirectionalLight from '$lib/svelte-cubed/lights/DirectionalLight.svelte';
	import Primitive from '$lib/svelte-cubed/objects/Primitive.svelte';
	import basketball from '$models/basketball.glb?url';
	import darkMode from '$lib/data/stores/theme';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

	let object,
		clock = new Clock(),
		time = 0,
		delta = 0,
		ballYRotation,
		width = 1,
		height = 1,
		depth = 1;

	onMount(() => {
		const info = get_root();
		console.log(info);
		const ktx2Loader = new KTX2Loader().setTranscoderPath('/scripts/').detectSupport(info.renderer);

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

<Primitive {object} scale={[width, height, depth]} rotation={[0.025, ballYRotation, 0.025]} />
<AmbientLight intensity={$darkMode ? 1.4 : 2} />
<OrbitControls enableZoom={false} enableDamping={true} dampingFactor={0.05} enablePan={false} />

<DirectionalLight intensity={$darkMode ? 0.4 : 0.6} position={[-1, 4, 2]} />
