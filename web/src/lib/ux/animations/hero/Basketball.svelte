<script lang="ts">
	import * as THREE from 'three';
	import { SVGLoader } from '$lib/ux/animations/utils/SVGLoader';
	import * as SC from 'svelte-cubed';
	import logo from './basketball.svg?raw';
	const [shape] = new SVGLoader().parse(logo).paths[0].toShapes(false);
	const geometry = new THREE.ExtrudeGeometry(shape, {
		curveSegments: 24,
		depth: 2,
		bevelEnabled: true,
		bevelOffset: 0,
		bevelSegments: 4,
		bevelSize: 1,
		bevelThickness: 1
	});
	geometry.center();
	let r = 0;

	geometry.center();

	SC.onFrame(() => {
		r -= 0.005;
	});
</script>

<SC.Mesh
	{geometry}
	material={new THREE.MeshStandardMaterial({
		wireframe: true
	})}
	position={[0, 0.4, 0]}
	rotation={[0, r, 0]}
	scale={0.03}
	castShadow
/>
