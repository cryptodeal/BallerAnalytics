<script lang="ts">
	import { random } from '../core/utils';
	export let size: number, foreground: string, background: string, x: number, y: number;
	let halfX = 2,
		halfY = 2;

	if (random([0, 1])) {
		halfX = 1;
	} else {
		halfY = 1;
	}
</script>

<g class="half-square">
	<rect height={size} width={size} fill={background} {x} {y} />
	<rect height={size / halfX} width={size / halfY} fill={foreground} {x} {y} />
</g>
