<script lang="ts">
	import * as Pancake from '@sveltejs/pancake/index.mjs';
	export let data: { x: number; y: number }[];
	export let label: string;
	let closest: { x: number; y: number };
	let x1 = Infinity;
	let x2 = -Infinity;
	let y1 = Infinity;
	let y2 = -Infinity;
	data.forEach((d) => {
		if (d.x < x1) x1 = d.x;
		if (d.x > x2) x2 = d.x;
		if (d.y < y1) y1 = d.y;
		if (d.y > y2) y2 = d.y;
	});

	const format_y = (y: number) => {
		return y.toFixed();
	};
	//$: console.log(data)
</script>

<div class="chart">
	<Pancake.Chart {x1} {x2} {y1} {y2}>
		<Pancake.Grid horizontal count={2} let:value let:first>
			<div class="grid-line horizontal">
				<span class:first>{format_y(value)}</span>
			</div>
		</Pancake.Grid>

		<Pancake.Grid vertical count={3} let:value>
			<span class="x-label">{value}</span>
		</Pancake.Grid>

		<Pancake.Svg>
			<Pancake.SvgLine {data} let:d>
				{#if d}
					<path class="data stroke-gray-800 dark:stroke-light-100" {d} />
				{/if}
			</Pancake.SvgLine>
		</Pancake.Svg>

		{#if closest}
			<Pancake.Point x={closest.x} y={closest.y}>
				<span class="annotation-point" />
				<div
					class="annotation navButton {y2 - closest.y >= closest.y - y1 ? 'locBottom' : 'locTop'}"
					style="transform: translate(-{100 * ((closest.x - x1) / (x2 - x1))}%,0);"
				>
					<strong>{closest.x}</strong>
					<span>{label}: {format_y(closest.y)}</span>
				</div>
			</Pancake.Point>
		{/if}

		<Pancake.Quadtree {data} bind:closest />
	</Pancake.Chart>
</div>

<style>
	.chart {
		height: 100%;
		padding: 1em 1.75em 3em 4em;
		margin: 0 0 36px 0;
		overflow: hidden;
		position: relative;
	}
	.grid-line {
		position: relative;
		display: block;
	}
	span.first {
		display: none;
	}
	.grid-line span {
		position: absolute;
		left: -4em;
		bottom: -11px;
		font-family: sans-serif;
		font-size: 14px;
	}
	.x-label {
		position: absolute;
		width: 4em;
		left: -2em;
		bottom: -22px;
		font-family: sans-serif;
		font-size: 14px;
		text-align: center;
	}
	path.data {
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 1px;
		fill: none;
	}
	.annotation {
		position: absolute;
		white-space: nowrap;
		line-height: 1.2;
		padding: 0.2em 0.4em;
		border-radius: 2px;
	}
	.locBottom {
		bottom: 1em;
	}
	.locTop {
		top: 1em;
	}
	.annotation-point {
		position: absolute;
		width: 10px;
		height: 10px;
		background-color: #ff3e00;
		border-radius: 50%;
		transform: translate(-50%, -50%);
	}
	.annotation strong {
		display: block;
		font-size: 20px;
	}
	.annotation span {
		display: block;
		font-size: 14px;
	}
</style>
