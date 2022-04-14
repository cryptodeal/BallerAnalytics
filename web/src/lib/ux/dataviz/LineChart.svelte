<script lang="ts">
	import * as Pancake from '@sveltejs/pancake/index.mjs';
	// import Circle from '$lib/ux/loading/Circle.svelte';
	export let data: { x: number; y: number }[] = [],
		yLabel = '',
		xLabel = '',
		title = '';
	let closest: { x: number; y: number };
	let x1 = 0;
	let x2 = -Infinity;
	let y1 = 0;
	let y2 = -Infinity;
	$: data.forEach((d) => {
		if (d.x < x1) x1 = d.x;
		if (d.x > x2) x2 = d.x;
		if (d.y < y1) y1 = d.y;
		if (d.y > y2) y2 = d.y;
	});

	const format_y = (y: number) => {
		return y.toFixed(2);
	};
</script>

<div class="w-full h-full flex flex-col items-center">
	<h3>{title}</h3>
	<div class="chart">
		<Pancake.Chart {x1} {x2} {y1} {y2}>
			<Pancake.Grid horizontal count={4} let:value>
				<div class="grid-line horizontal">
					<span class="text-xs text-dark-800 dark:text-light-200">{format_y(value)} {yLabel}</span>
				</div>
			</Pancake.Grid>

			<Pancake.Grid vertical count={4} let:value let:first>
				<span class="x-label text-xs text-dark-800 dark:text-light-200" class:first
					>{xLabel} {value}</span
				>
			</Pancake.Grid>
			<Pancake.Svg>
				<Pancake.SvgLine {data} let:d>
					{#if data.length > 3}
						<path class="data stroke-blue-400" {d} />
					{/if}
				</Pancake.SvgLine>
			</Pancake.Svg>
			{#if closest}
				<Pancake.Point x={closest.x} y={closest.y}>
					<span class="annotation-point" />
					<div
						class="rounded-lg glassmorphicCard annotation navButton {y2 - closest.y >=
						closest.y - y1
							? 'locBottom'
							: 'locTop'}"
						style="transform: translate(-{100 * ((closest.x - x1) / (x2 - x1))}%,0);"
					>
						<strong class="text-dark-800 dark:text-light-200">{xLabel}: {closest.x}</strong>
						<span class="text-dark-800 dark:text-light-200">{yLabel}: {format_y(closest.y)}</span>
					</div>
				</Pancake.Point>
			{/if}

			<Pancake.Quadtree {data} bind:closest />
		</Pancake.Chart>
	</div>
</div>

<style>
	.chart {
		height: 100%;
		width: 100%;
		padding: 1em 2em 1.5em 4em;
		margin: 0 0 36px 0;
		overflow: hidden;
		position: relative;
	}
	.grid-line {
		position: absolute;
		display: block;
	}

	.first {
		display: none;
	}
	.grid-line span {
		position: absolute;
		left: -4em;
		bottom: -11px;
		font-family: sans-serif;
		font-size: 12px;
	}
	.x-label {
		position: absolute;
		width: 4em;
		left: -2em;
		bottom: -22px;
		font-family: sans-serif;
		font-size: 12px;
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
