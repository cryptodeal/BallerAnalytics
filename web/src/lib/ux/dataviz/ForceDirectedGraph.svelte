<script lang="ts">
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	import { select } from 'd3-selection';

	import { zoom, zoomIdentity } from 'd3-zoom';
	import { drag } from 'd3-drag';
	import { shape, intersect } from 'svg-intersections';
	// import { Chart, Svg, SvgLine, SvgPolygon } from '@sveltejs/pancake/index.mjs';
	import { linearScale } from 'yootils';
	import { NodeType } from '@balleranalytics/tf-neat';

	import type { CXNData, CXNGraphData, NodeData, NodeGraphData } from './types';
	import type { SimulationNodeDatum, SimulationLinkDatum, Simulation } from 'd3-force';

	export let nodes: { type: NodeType; id: number; label: number }[],
		cxns: { id: number; enabled: boolean; source: number; target: number; label: string }[];

	let svg,
		simulation: undefined | Simulation<SimulationNodeDatum, undefined>,
		width = 1,
		height = 1,
		transform = zoomIdentity;

	const r = 4;

	$: x1 = Infinity;
	$: x2 = -Infinity;
	$: y1 = Infinity;
	$: y2 = -Infinity;

	$: simulation = forceSimulation(nodes as SimulationNodeDatum[])
		.force(
			'link',
			forceLink(cxns).id((d: any) => d.id)
		)
		.force('charge', forceManyBody())
		.force('center', forceCenter(width / 2, height / 2))
		.on('tick', simulationUpdate);

	$: select(svg)
		.call(
			drag()
				.container(svg)
				.subject(dragsubject)
				.on('start', dragstarted)
				.on('drag', dragged)
				.on('end', dragended)
		)
		.call(
			zoom()
				.scaleExtent([1 / 10, 8])
				.on('zoom', zoomed)
		);

	$: cxnData = cxns as unknown[] as CXNData[];
	$: nodeData = nodes as unknown[] as NodeData[];

	$: cxnData.forEach(({ target, source }) => {
		if (source.x < x1) x1 = source.x;
		if (source.x > x2) x2 = source.x;
		if (source.y < y1) y1 = source.y;
		if (source.y > y2) y2 = source.y;
		if (target.x < x1) x1 = target.x;
		if (target.x > x2) x2 = target.x;
		if (target.y < y1) y1 = target.y;
		if (target.y > y2) y2 = target.y;
	});

	$: nodeData.forEach(({ x, y }) => {
		if (x < x1) x1 = x;
		if (x > x2) x2 = x;
		if (y < y1) y1 = y;
		if (y > y2) y2 = y;
	});

	/* TODO: Test repl version of demo w drag */
	function simulationUpdate() {
		simulation.tick();
		nodes = [...nodes];
		cxns = [...cxns];
	}
	function zoomed(currentEvent) {
		transform = currentEvent.transform;
		simulationUpdate();
	}
	function dragsubject(currentEvent) {
		const node = simulation.find(
			transform.invertX(currentEvent.x),
			transform.invertY(currentEvent.y),
			r
		);
		if (node) {
			node.x = transform.applyX(node.x);
			node.y = transform.applyY(node.y);
		}
		return node;
	}
	function dragstarted(currentEvent) {
		if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
		currentEvent.subject.fx = transform.invertX(currentEvent.subject.x);
		currentEvent.subject.fy = transform.invertY(currentEvent.subject.y);
	}
	function dragged(currentEvent) {
		currentEvent.subject.fx = transform.invertX(currentEvent.x);
		currentEvent.subject.fy = transform.invertY(currentEvent.y);
	}
	function dragended(currentEvent) {
		if (!currentEvent.active) simulation.alphaTarget(0);
		currentEvent.subject.fx = null;
		currentEvent.subject.fy = null;
	}
	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}
</script>

<div class="flex mx-auto h-400px w-400px lg:(h-700px w-700px)">
	<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
		<svg bind:this={svg} {width} {height}>
			{#each cxnData as { source: { x: x1, y: y1 }, target: { x: x2, y: y2 }, label }}
				{@const lineCx = (x1 + x2) / 2}
				{@const lineCy = (y1 + y2) / 2}
				{@const endIntersect = intersect(
					shape('circle', { cx: x2, cy: y2, r }),
					shape('line', { x1, y1, x2, y2 })
				)}
				{@const endX = endIntersect?.points?.length ? endIntersect.points[0].x : x2}
				{@const endY = endIntersect?.points?.length ? endIntersect.points[0].y : y2}
				{@const startIntersect = intersect(
					shape('circle', { cx: x1, cy: y1, r }),
					shape('line', { x1, y1, x2, y2 })
				)}
				{@const startX = startIntersect?.points?.length ? startIntersect.points[0].x : x1}
				{@const startY = startIntersect?.points?.length ? startIntersect.points[0].y : y1}
				{@const angle = Math.atan2(y2 - y1, x2 - x1)}
				{@const cX = (((lineCx + endX) / 2 + endX) / 2 + endX) / 2}
				{@const cY = (((lineCy + endY) / 2 + endY) / 2 + endY) / 2}
				{@const baseX = ((lineCx + cX) / 2 + cX) / 2}
				{@const baseY = ((lineCy + cY) / 2 + cY) / 2}
				{@const arrowHead = [
					{ x: Math.sin(angle) + baseX, y: -Math.cos(angle) + baseY },
					{ x: -Math.sin(angle) + baseX, y: Math.cos(angle) + baseY },
					{ x: endX, y: endY },
					{ x: Math.sin(angle) + baseX, y: -Math.cos(angle) + baseY }
				]}
				{@const textProps = {
					x: lineCx,
					y: lineCy,
					// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
					'text-anchor': 'start',
					'font-size': `2px`
				}}
				<g class="stroke-dark-800 fill-dark-800 dark:(stroke-light-200 fill-light-200)">
					<line
						x1={startX}
						y1={startY}
						x2={endX}
						y2={endY}
						transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
					>
						<title>Weight: {label}</title>
					</line>
					<polygon
						points={arrowHead.map(({ x, y }) => `${x},${y}`).join(' ')}
						transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
					/>
				</g>
				<text
					class="fill-blue-500"
					{...textProps}
					transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
					>{label}</text
				>
			{/each}

			{#each nodeData as { x: cx, y: cy, type, activation }}
				{@const nodeTypeProps = {
					x: cx,
					y: cy,
					'text-anchor': 'middle',
					'font-size': `2px`
				}}
				{@const actProps = {
					x: cx,
					y: cy + 2,
					'text-anchor': 'middle',
					'font-size': `2px`
				}}
				<circle
					class="node"
					{cx}
					{cy}
					{r}
					style:--fillColor={type === NodeType.INPUT
						? '#87bdd8'
						: type === NodeType.OUTPUT
						? '#daebe8'
						: '#b7d7e8'}
					transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
				>
					<title>NodeType: {type}</title>
				</circle>
				<text
					{...nodeTypeProps}
					transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
					>{type}</text
				>
				{#if activation}
					<text
						{...actProps}
						transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
						>{activation}</text
					>
				{/if}
			{/each}
		</svg>
		<!--
      <Chart {x1} {x2} {y1} {y2} {width} {height}>
			<Svg>
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
						r={4}
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

				{#each cxns as { source, target, label }}
					{@const lineCenterX = (source.x + target.x) / 2}
					{@const lineCenterY = (source.y + target.y) / 2}
					{@const endIntersect = intersect(
						shape('circle', { cx: xScale(target.x), cy: yScale(target.y), r: 4 }),
						shape('line', {
							x1: xScale(source.x),
							y1: yScale(source.y),
							x2: xScale(target.x),
							y2: yScale(target.y)
						})
					)}
					{@const endX = endIntersect?.points?.length
						? xScaleInv(endIntersect.points[0].x)
						: target.x}
					{@const endY = endIntersect?.points?.length
						? yScaleInv(endIntersect.points[0].y)
						: target.y}
					{@const startIntersect = intersect(
						shape('circle', { cx: xScale(source.x), cy: yScale(source.y), r: 4 }),
						shape('line', {
							x1: xScale(source.x),
							y1: yScale(source.y),
							x2: xScale(target.x),
							y2: yScale(target.y)
						})
					)}
					{@const startX = startIntersect?.points?.length
						? xScaleInv(startIntersect.points[0].x)
						: source.x}
					{@const startY = startIntersect?.points?.length
						? yScaleInv(startIntersect.points[0].y)
						: source.y}
					{@const data = [
						{ x: startX, y: startY },
						{ x: endX, y: endY }
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
					{@const cX = (((lineCenterX + endX) / 2 + endX) / 2 + endX) / 2}
					{@const cY = (((lineCenterY + endY) / 2 + endY) / 2 + endY) / 2}
					{@const baseX = ((lineCenterX + cX) / 2 + cX) / 2}
					{@const baseY = ((lineCenterY + cY) / 2 + cY) / 2}
					{@const arrowHead = [
						{ x: Math.sin(angle) + baseX, y: -Math.cos(angle) + baseY },
						{ x: -Math.sin(angle) + baseX, y: Math.cos(angle) + baseY },
						{ x: endX, y: endY },
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
			</Svg>
		</Chart>
  -->
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

	circle.node {
		fill: var(--fillColor);
	}
</style>
