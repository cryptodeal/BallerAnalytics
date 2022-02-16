<script lang="ts">
	export let size: number, foreground: string, background: string, x: number, y: number;
</script>

<g class="draw-circle">
	<rect width={size} height={size} fill={background} {x} {y} />
	<circle r={size / 2} cx={x + size / 2} cy={y + size / 2} fill={foreground} />
</g>
