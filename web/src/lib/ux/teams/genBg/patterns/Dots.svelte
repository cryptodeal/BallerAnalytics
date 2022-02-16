<script lang="ts">
	import { random } from '../core/utils';
	export let size: number, foreground: string, background: string, x: number, y: number;

	const sizeOptions: number[] = [2, 3, 4],
		dotSize: number = random(sizeOptions),
		offset = 10,
		circleSize = 10,
		space = (size - offset * 2 - circleSize) / (dotSize - 1);
</script>

<g class="dots">
	<rect width={size} height={size} fill={background} {x} {y} />
	{#each { length: dotSize } as _, i}
		{#each { length: dotSize } as _, j}
			<circle
				r={circleSize / 2}
				fill={foreground}
				cx={x + (offset * 3) / 2 + i * space}
				cy={y + (offset * 3) / 2 + j * space}
			/>
		{/each}
	{/each}
</g>
