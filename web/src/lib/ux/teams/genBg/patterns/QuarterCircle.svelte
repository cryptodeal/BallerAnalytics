<script lang="ts">
	import { SVG, random } from '../core/utils';
	export let size: number, foreground: string, background: string, x: number, y: number;

	const xOffset = size * random([0, 1], true),
		yOffset = size * random([0, 1], true);

	function mask(node: SVGGElement) {
		const mask = SVG().rect(size, size).fill('#fff').move(x, y);
		SVG(node).maskWith(mask);
	}
</script>

<g class="quarter-circle">
	<rect width={size} height={size} fill={background} {x} {y} />
</g>

<g use:mask>
	<circle r={size} cx={x + xOffset} cy={y + yOffset} fill={foreground} />
	{#if Math.random() < 0.6}
		<circle r={size / 2} cx={x + xOffset} cy={y + yOffset} fill={background} />
	{/if}
</g>
