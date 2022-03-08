<script lang="ts">
	import { Object3D } from 'three';
	import { setup } from '../context';
	import { transform } from '../utils/object';
	import * as defaults from '../utils/defaults';
	export let object: Object3D;
	export let position = defaults.position;
	export let rotation = defaults.rotation;
	export let scale = defaults.scale;
	const { root, self } = setup(new Object3D());
	let previous: Object3D;
	$: {
		if (previous) {
			self.remove(previous);
		}
		if (object) {
			self.add(object);
		}
		previous = object;
		root.invalidate();
	}
	$: {
		transform(self, position, rotation, scale);
		root.invalidate();
	}
</script>

{#if object}
	<slot />
{/if}
