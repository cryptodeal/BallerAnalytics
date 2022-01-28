<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import { browser } from '$app/env';
	export let height: number;
	export let width: number;
	let ballTexture;

	if (browser) {
		ballTexture = new THREE.TextureLoader().load('basketball.png');
	}
	let clock = new THREE.Clock();
	let time = 0;
	let delta = 0;
	let ballXRotation = 0;

	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballXRotation = time * 2;
	});
</script>

<SC.Canvas antialias alpha={true} background={null} {height} {width}>
	<SC.Mesh
		geometry={new THREE.SphereGeometry(2, 17, 17)}
		material={new THREE.MeshBasicMaterial({
			map: ballTexture
		})}
		rotation={[0, ballXRotation, 0]}
	/>
	<SC.PerspectiveCamera position={[2, 3, 5]} />
</SC.Canvas>
