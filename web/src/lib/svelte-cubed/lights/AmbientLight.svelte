<script lang="ts">
	import { setup } from '../context';
	import { AmbientLight } from 'three';
	import type { Color } from 'three';

	export let color: string | number | Color = 0xffffff;
	export let intensity = 1;

	const { root, self } = setup(new AmbientLight(color, intensity));

	$: {
		self.color.set(color);
		self.intensity = intensity;
		root.invalidate();
	}
</script>
