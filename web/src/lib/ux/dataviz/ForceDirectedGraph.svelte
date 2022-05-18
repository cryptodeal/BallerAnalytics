<script lang="ts">
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	import { browser } from '$app/env';
	import { select } from 'd3-selection';
	import forceBoundary from 'd3-force-boundary';
	import { zoom, zoomIdentity } from 'd3-zoom';
	import { drag } from 'd3-drag';
	import { shape, intersect } from 'svg-intersections';
	import { NodeType } from '@balleranalytics/tf-neat';

	import type { CXNData, NodeData } from './types';
	import type { SimulationNodeDatum, Simulation } from 'd3-force';
	import { onMount } from 'svelte';

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
			forceLink(cxns).id((d: any) => d.id)
		)
		.force('charge', forceManyBody())
		.force(
			'boundary',
			forceBoundary(-width / 2 + 10, -height / 2 + 10, width / 2 - 10, height / 2 - 10)
		)
		.on('tick', simulationUpdate);

	onMount(() =>
		select(svg)
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
			)
	);

	/* TODO: Test repl version of demo w drag */
	let nodeData: NodeData[] = [],
		cxnData: CXNData[] = [];

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

	$: nodeData = nodes as unknown as NodeData[];
	$: cxnData = cxns as unknown as CXNData[];
</script>

<div class="flex mx-auto h-400px w-400px md:(h-600px w-600px) xl:(h-750px w-full)">
	<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
		<svg bind:this={svg} {width} {height} viewBox="{-width / 2} {-height / 2} {width} {height}">
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
				<g transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})">
					<line
						class="stroke-dark-800 dark:stroke-light-200"
						x1={startX}
						y1={startY}
						x2={baseX}
						y2={baseY}
					>
						<title>Weight: {label}</title>
					</line>
					<polygon
						class="fill-dark-800 dark:fill-light-200"
						points={arrowHead.map(({ x, y }) => `${x},${y}`).join(' ')}
					/>
					<text class="fill-blue-500 cursor-not-allowed" {...textProps}>{label}</text>
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

<style>
	.chart {
		height: 100%;
		width: 100%;
		padding: 2rem;
		overflow: hidden;
		position: relative;
	}

	svg {
		width: 100%;
		height: 100%;
	}

	circle.node {
		fill: var(--fillColor);
	}
</style>
