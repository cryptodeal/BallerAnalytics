<script lang="ts">
	import FDG from '$lib/ux/dataviz/ForceDirectedGraph.svelte';
	import { Genome, Neat, NodeGene, NodeType, CxnGene, TFGenome } from '@balleranalytics/tf-neat';
	import { tensor } from '@tensorflow/tfjs';
	import { onMount } from 'svelte';
	import StatLabel from '$lib/ux/dataviz/StatLabel.svelte';

	let startGen: Genome,
		nodeData: { type: NodeType; id: number; label: number }[] = [],
		cxnData: { id: number; enabled: boolean; source: number; target: number; label: string }[] = [],
		currentGen = 0,
		currentHighFitness = 0,
		currentSpecies = 0,
		currentCxns = 0,
		currentNodes = 0;

	onMount(async () => {
		startGen = new Genome();
		startGen.addNode(new NodeGene(NodeType.INPUT, 0));
		startGen.addNode(new NodeGene(NodeType.INPUT, 1));
		startGen.addNode(new NodeGene(NodeType.HIDDEN, 2));
		startGen.addNode(new NodeGene(NodeType.OUTPUT, 3));
		startGen.addConnection(0, 2);
		startGen.addConnection(1, 2);
		startGen.addConnection(2, 3);

		const neat = new Neat(startGen, (gen: Genome) => {
			const inputs = [
				[0, 1, 0, 1],
				[0, 0, 1, 1]
			];
			const labels = [0, 1, 1, 0];

			const outputTensor = TFGenome.toTFGraph(gen, inputs)[0];

			const mse = (preds, labels) => preds.sub(labels).square().mean();
			const fitness = -mse(outputTensor, tensor(labels)).dataSync()[0];

			return fitness;
		});
		for (let i = 0; i < 100; i++) {
			const { generation, highestFitness, species, connections, nodes } = neat.nextGeneration();
			currentGen = generation;
			currentHighFitness = highestFitness;
			currentSpecies = species;
			currentCxns = connections;
			currentNodes = nodes;
			nodeData = neat.fittestGenome.getNodes().map(({ type, id, level }) => {
				return { type, id, label: level };
			});
			cxnData = neat.fittestGenome
				.getConnections()
				.map(({ enabled, innovation, inNodeId, outNodeId, weight }) => {
					return {
						id: innovation,
						source: inNodeId,
						target: outNodeId,
						label: weight.toFixed(3),
						enabled
					};
				})
				.filter((c) => c.enabled);
			await new Promise((res) => setTimeout(res, 1750));
		}
	});
</script>

<div class="w-screen min-h-screen bg-hero-circuit-board-blue-30">
	<div class="appContent w-full">
		<div
			class="mt-10 w-full flex flex-wrap items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
		>
			<div class="flex gap-4 w-full flex-col">
				<h3 class="text-center">NEAT: XOR Problem (200 generations)</h3>
				<div class="flex flex-wrap gap-4 w-full justify-evenly">
					<StatLabel title="Generation" value={currentGen} />
					<StatLabel title="Highest Fitness" value={currentHighFitness} />
					<StatLabel title="Species" value={currentSpecies} />
					<StatLabel title="Connections" value={currentCxns} />
					<StatLabel title="Nodes" value={currentNodes} />
				</div>
			</div>
			<div class="w-full h-200">
				<FDG title="NEAT: XOR Problem (200 generations)" {nodeData} {cxnData} />
			</div>
		</div>
	</div>
</div>
