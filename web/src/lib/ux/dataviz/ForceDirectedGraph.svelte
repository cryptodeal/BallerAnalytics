<script lang="ts">
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	import { Chart, Svg, SvgLine, SvgPoint, SvgPolygon } from '@sveltejs/pancake/index.mjs';
	import { linearScale } from 'yootils';

	import type { CXNGraphData } from './types';
	import { NodeType } from '@balleranalytics/tf-neat';

	export let nodeData: { type: NodeType; id: number; label: number }[],
		cxnData: { id: number; enabled: boolean; source: number; target: number; label: string }[],
		title: string | undefined;

	let x1 = Infinity,
		x2 = -Infinity,
		y1 = Infinity,
		y2 = -Infinity,
		width = 0,
		height = 0,
		simulation: any,
		cxns: CXNGraphData[] = [],
		nodes: {
			type: NodeType;
			id: number;
			index: number;
			label: number;
			vx: number;
			vy: number;
			x;
			y;
		}[] = [];

	$: if (nodeData?.length && cxnData?.length)
		simulation = forceSimulation(nodeData)
			.force(
				'link',
				forceLink(cxnData).id((d) => d.id)
			)
			.force('charge', forceManyBody())
			.force('center', forceCenter(width / 2, height / 2))
			.on('tick', () => {
				nodes = nodeData as unknown as {
					type: NodeType;
					id: number;
					index: number;
					label: number;
					vx: number;
					vy: number;
					x;
					y;
				}[];
				cxns = cxnData as unknown as CXNGraphData[];
			});
	$: xScale = linearScale([x1, x2], [0, 100]);
	$: yScale = linearScale([y1, y2], [100, 0]);

	$: cxns.forEach(({ target, source }) => {
		if (source.x < x1) x1 = source.x;
		if (source.x > x2) x2 = source.x;
		if (source.y < y1) y1 = source.y;
		if (source.y > y2) y2 = source.y;
		if (target.x < x1) x1 = target.x;
		if (target.x > x2) x2 = target.x;
		if (target.y < y1) y1 = target.y;
		if (target.y > y2) y2 = target.y;
	});

	$: nodes.forEach(({ x, y }) => {
		if (x < x1) x1 = x;
		if (x > x2) x2 = x;
		if (y < y1) y1 = y;
		if (y > y2) y2 = y;
	});
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<Chart {x1} {x2} {y1} {y2}>
		<Svg>
			{#each cxns as { source, target, label }}
				{@const data = [
					{ x: source.x, y: source.y },
					{ x: target.x, y: target.y }
				]}
				{@const angle = Math.atan2(target.y - source.y, target.x - source.x)}
				{@const lineCenterX = (source.x + target.x) / 2}
				{@const lineCenterY = (source.y + target.y) / 2}
				{@const textProps = {
					x: xScale(lineCenterX),
					y: yScale(lineCenterY),
					'transform-origin': `${xScale(lineCenterX)} ${yScale(lineCenterY)}`,
					// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
					'text-anchor': 'start',
					'font-size': `1.5px`
				}}
				{@const cX = ((lineCenterX + target.x) / 2 + target.x) / 2}
				{@const cY = ((lineCenterY + target.y) / 2 + target.y) / 2}
				{@const arrowHead = [
					{ x: Math.sin(angle) + cX, y: -Math.cos(angle) + cY },
					{ x: -Math.sin(angle) + cX, y: Math.cos(angle) + cY },
					{ x: ((cX + target.x) / 2 + target.x) / 2, y: ((cY + target.y) / 2 + target.y) / 2 },
					{ x: Math.sin(angle) + cX, y: -Math.cos(angle) + cY }
				]}
				<SvgLine {data} let:d>
					<path class="data stroke-dark-800 dark:stroke-light-200" {d} />
				</SvgLine>
				<SvgPolygon data={arrowHead} let:d>
					<path
						class="arrowHead fill-dark-800 stroke-dark-800 dark:(stroke-light-200 fill-light-200)"
						{d}
					/>
				</SvgPolygon>
				<text class="fill-blue-500" {...textProps}>{label}</text>
			{/each}

			{#each nodes as { x, y, type }}
				{@const textProps = {
					x: xScale(x),
					y: yScale(y),
					'transform-origin': `${xScale(x)} ${yScale(y)}`,
					'text-anchor': 'middle',
					'font-size': `1px`
				}}
				<SvgPoint {x} {y} let:d>
					<path
						class="node z-0"
						{d}
						style:--fillColor={type === NodeType.INPUT
							? '#87bdd8'
							: type === NodeType.OUTPUT
							? '#daebe8'
							: '#b7d7e8'}
					/>
				</SvgPoint>
				<text {...textProps}>{type}</text>
			{/each}
		</Svg>
	</Chart>
</div>

<style>
	.chart {
		height: 100%;
		width: 100%;
		padding: 4em 4em 4em 4em;
		overflow: hidden;
		position: relative;
	}

	path.data {
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 1px;
		fill: none;
	}

	path.node {
		stroke: var(--fillColor);
		stroke-linecap: round;
		stroke-width: 3rem;
		fill: none;
	}
</style>
