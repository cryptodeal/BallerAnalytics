<script lang="ts">
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	import { shape, intersect } from 'svg-intersections';
	import { Chart, Svg, SvgLine, SvgPolygon } from '@sveltejs/pancake/index.mjs';
	import { linearScale } from 'yootils';
	import { NodeType } from '@balleranalytics/tf-neat';

	import type { CXNGraphData, NodeGraphData } from './types';

	export let nodeData: { type: NodeType; id: number; label: number }[],
		cxnData: { id: number; enabled: boolean; source: number; target: number; label: string }[];

	let cxns: CXNGraphData[] = [],
		nodes: NodeGraphData[] = [];

	$: width = 0;
	$: height = 0;
	$: x1 = Infinity;
	$: x2 = -Infinity;
	$: y1 = Infinity;
	$: y2 = -Infinity;

	$: simulation = forceSimulation(nodeData)
		.force(
			'link',
			forceLink(cxnData).id((d) => d.id)
		)
		.force('charge', forceManyBody())
		.force('center', forceCenter(width, height))
		.on('tick', () => {
			nodes = nodeData as unknown as NodeGraphData[];
			cxns = cxnData as unknown as CXNGraphData[];
		});
	$: xScale = linearScale([x1, x2], [0, 100]);
	$: xScaleInv = xScale.inverse();
	$: yScale = linearScale([y1, y2], [100, 0]);
	$: yScaleInv = yScale.inverse();

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

<div class="flex mx-auto h-400px w-400px lg:(h-700px w-700px)">
	<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
		<Chart {x1} {x2} {y1} {y2}>
			<Svg>
				{#each cxns as { source, target, label }}
					{@const lineCenterX = (source.x + target.x) / 2}
					{@const lineCenterY = (source.y + target.y) / 2}
					{@const {
						points: [{ x: endX, y: endY }]
					} = intersect(
						shape('circle', { cx: xScale(target.x), cy: yScale(target.y), r: 5 }),
						shape('line', {
							x1: xScale(source.x),
							y1: yScale(source.y),
							x2: xScale(target.x),
							y2: yScale(target.y)
						})
					)}
					{@const {
						points: [{ x: startX, y: startY }]
					} = intersect(
						shape('circle', { cx: xScale(source.x), cy: yScale(source.y), r: 5 }),
						shape('line', {
							x1: xScale(source.x),
							y1: yScale(source.y),
							x2: xScale(target.x),
							y2: yScale(target.y)
						})
					)}
					{@const data = [
						{ x: xScaleInv(startX), y: yScaleInv(startY) },
						{ x: xScaleInv(endX), y: yScaleInv(endY) }
					]}
					{@const textProps = {
						x: xScale(lineCenterX),
						y: yScale(lineCenterY),
						'transform-origin': `${xScale(lineCenterX)} ${yScale(lineCenterY)}`,
						// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
						'text-anchor': 'start',
						'font-size': `2px`
					}}
					{@const angle = Math.atan2(target.y - source.y, target.x - source.x)}
					{@const cX =
						(((lineCenterX + xScaleInv(endX)) / 2 + xScaleInv(endX)) / 2 + xScaleInv(endX)) / 2}
					{@const cY =
						(((lineCenterY + yScaleInv(endY)) / 2 + yScaleInv(endY)) / 2 + yScaleInv(endY)) / 2}
					{@const baseX = ((lineCenterX + cX) / 2 + cX) / 2}
					{@const baseY = ((lineCenterY + cY) / 2 + cY) / 2}
					{@const arrowHead = [
						{ x: Math.sin(angle) + baseX, y: -Math.cos(angle) + baseY },
						{ x: -Math.sin(angle) + baseX, y: Math.cos(angle) + baseY },
						{ x: xScaleInv(endX), y: yScaleInv(endY) },
						{ x: Math.sin(angle) + baseX, y: -Math.cos(angle) + baseY }
					]}

					<SvgPolygon data={arrowHead} let:d>
						<path class="arrowHead fill-dark-800 dark:fill-light-200" {d} />
					</SvgPolygon>
					<SvgLine {data} let:d>
						<path class="data stroke-dark-800 dark:stroke-light-200" {d} />
					</SvgLine>
					<text class="fill-blue-500" {...textProps}>{label}</text>
				{/each}

				{#each nodes as { x, y, type, activation }}
					{@const nodeTypeProps = {
						x: xScale(x),
						y: yScale(y),
						'transform-origin': `${xScale(x)} ${yScale(y)}`,
						'text-anchor': 'middle',
						'font-size': `2px`
					}}
					{@const actProps = {
						x: xScale(x),
						y: yScale(y) + 2,
						'transform-origin': `${xScale(x)} ${yScale(y) + 2}`,
						'text-anchor': 'middle',
						'font-size': `2px`
					}}
					<circle
						class="node"
						cx={xScale(x)}
						cy={yScale(y)}
						r={5}
						style:--fillColor={type === NodeType.INPUT
							? '#87bdd8'
							: type === NodeType.OUTPUT
							? '#daebe8'
							: '#b7d7e8'}
					/>

					<text {...nodeTypeProps}>{type}</text>
					{#if activation}
						<text {...actProps}>{activation}</text>
					{/if}
				{/each}
			</Svg>
		</Chart>
	</div>
</div>

<style>
	.chart {
		height: 100%;
		width: 100%;
		padding: 2rem;
		overflow: hidden;
		position: relative;
	}

	path.data {
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 1px;
		fill: none;
	}

	circle.node {
		fill: var(--fillColor);
	}
</style>
