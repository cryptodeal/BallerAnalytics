<script lang="ts">
	import { setup } from '../context';
	import { DirectionalLight } from 'three';

	import type { Color } from 'three';
	import type { Position } from '../types';
	import type { DirectionalShadowOpts } from './lights';

	export let color: string | number | Color = 0xffffff;
	export let intensity = 1;
	export let position: Position = [0, 1, 0];
	export let target: Position = [0, 0, 0];

	export let shadow: boolean | DirectionalShadowOpts = null;
	const { root, self } = setup(new DirectionalLight());
	$: {
		self.color.set(color);
		self.intensity = intensity;
		self.position.set(position[0], position[1], position[2]);
		self.target.position.set(target[0], target[1], target[2]);
		root.invalidate();
	}
	$: {
		if (shadow) {
			const {
				mapSize = [512, 512],
				camera: { left = -5, bottom = -5, right = 5, top = 5, near = 0.5, far = 500 } = {},
				bias = 0,
				radius = 1
			} = shadow === true ? {} : shadow;
			self.shadow.mapSize.set(mapSize[0], mapSize[1]);
			self.shadow.camera.left = left;
			self.shadow.camera.top = top;
			self.shadow.camera.right = right;
			self.shadow.camera.bottom = bottom;
			self.shadow.camera.near = near;
			self.shadow.camera.far = far;
			self.shadow.bias = bias;
			self.shadow.radius = radius;
			self.castShadow = true;
		} else {
			self.castShadow = false;
		}
		root.invalidate();
	}
</script>
