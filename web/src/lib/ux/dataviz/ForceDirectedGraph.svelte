<script lang="ts">
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	import { select } from 'd3-selection';
	import forceBoundary from 'd3-force-boundary';
	import { zoom, zoomIdentity } from 'd3-zoom';
	import { drag } from 'd3-drag';
	import { shape, intersect } from 'svg-intersections';
	import { NodeType } from '@balleranalytics/tf-neat';

	import type { CXNData, NodeData } from './types';
	import type { SimulationNodeDatum, Simulation } from 'd3-force';

	export let nodes: { type: NodeType; id: number; label: number }[],
		cxns: { id: number; enabled: boolean; source: number; target: number; label: string }[];

	let svg,
		simulation: Simulation<SimulationNodeDatum, CXNData>,
		width = 1,
		height = 1,
		transform = zoomIdentity;

	const r = 5;

	$: simulation = forceSimulation(nodes as SimulationNodeDatum[])
		.force(
			'link',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			forceLink(cxns).id((d: any) => d.id)
		)
		.force('center', forceCenter(width / 2, height / 2))
		.force('charge', forceManyBody())
		.force('boundary', forceBoundary(0, 0, width, height))
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
				.scaleExtent([1 / 5, 10])
				.on('zoom', zoomed)
		);

	/* TODO: Test repl version of demo w drag */
	$: nodeData = [];
	$: cxnData = [];

	function simulationUpdate() {
		simulation.tick();
		nodeData = [...nodes] as unknown as NodeData[];
		cxnData = [...cxns] as unknown as CXNData[];
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
</script>

<div class="flex mx-auto h-[300px] w-[300px] md:h-[600px] md:w-[600px] xl:h-[750px] xl:w-full">
	<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
		<svg bind:this={svg} {width} {height} viewBox="0 0 {width} {height}">
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
					'font-size': `3px`
				}}
				<g transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})">
					<line class="stroke-current" x1={startX} y1={startY} x2={baseX} y2={baseY}>
						<title>Weight: {label}</title>
					</line>
					<polygon
						class="fill-current"
						points={arrowHead.map(({ x, y }) => `${x},${y}`).join(' ')}
					/>
					<text class="fill-blue-500 cursor-grab" {...textProps}>{label}</text>
				</g>
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
					class="node cursor-grab"
					{cx}
					{cy}
					{r}
					transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
					style:--fillColor={type === NodeType.INPUT
						? '#87bdd8'
						: type === NodeType.OUTPUT
						? '#daebe8'
						: '#b7d7e8'}
				>
					<title>NodeType: {type}</title>
				</circle>
				<text
					class="cursor-grab"
					transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
					{...nodeTypeProps}>{type}</text
				>
				{#if activation}
					<text
						class="cursor-grab"
						transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
						{...actProps}>{activation}</text
					>
				{/if}
			{/each}
		</svg>
	</div>
</div>

<style lang="postcss">
	.chart {
		height: 100%;
		width: 100%;
	}

	circle.node {
		fill: var(--fillColor);
	}
</style>
