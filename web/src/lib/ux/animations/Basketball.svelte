<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import { browser } from '$app/env';
	export let height: number;
	export let width: number;
	let ballTexture;
	let courtTexture;
	if (browser) {
		ballTexture = new THREE.TextureLoader().load('basketball.png');
		courtTexture = new THREE.TextureLoader().load('texture.png');
	}
	let clock = new THREE.Clock();
	let time = 0;
	let delta = 0;
	let ballXRotation = 0;
	let ballYPosition = 0;
	let ballZPosition = 0;

	SC.onFrame(() => {
		delta = clock.getDelta();
		time += delta;
		ballXRotation = time * 4;
		ballYPosition = 0.5 + Math.abs(Math.sin(time * 3)) * 2;
		ballZPosition = Math.cos(time) * 4;
	});
</script>

<SC.Canvas antialias alpha={true} background={null} {height} {width}>
	<SC.Mesh
		geometry={new THREE.PlaneGeometry(100, 100, 100, 100)}
		material={new THREE.MeshBasicMaterial({
			map: courtTexture
		})}
		rotation={[-Math.PI * 0.5, 0, 0]}
	/>
	<SC.Mesh
		geometry={new THREE.SphereGeometry(0.5, 16, 8)}
		material={new THREE.MeshBasicMaterial({
			map: ballTexture
		})}
		rotation={[ballXRotation, 0, 0]}
		position={[0, ballYPosition, ballZPosition]}
	/>
	<SC.PerspectiveCamera position={[2, 3, 5]} />
	<SC.OrbitControls enableZoom={false} />
</SC.Canvas>
