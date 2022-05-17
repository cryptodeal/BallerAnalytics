<script lang="ts">
	import FDG from '$lib/ux/dataviz/ForceDirectedGraph.svelte';
	import { Genome, Neat, NodeGene, NodeType, TFGenome } from '@balleranalytics/tf-neat';
	import { tensor } from '@tensorflow/tfjs';
	import { onMount } from 'svelte';
	import StatLabel from '$lib/ux/dataviz/StatLabel.svelte';
	import { writable } from 'svelte/store';

	let startGen: Genome,
		nodeData: { type: NodeType; id: number; label: number }[] = [],
		cxnData: { id: number; enabled: boolean; source: number; target: number; label: string }[] = [],
		currentGen = 0,
		currentHighFitness = 0,
		currentSpecies = 0,
		currentCxns = 0,
		currentNodes = 0,
		neat: Neat;

	const dropoff = writable(false),
		dropoffAge = writable(15),
		enabled = writable(true);

	async function runGen() {
		while ($enabled) {
			const { generation, highestFitness, species, connections, nodes } = neat.nextGeneration();
			currentGen = generation;
			currentHighFitness = highestFitness;
			currentSpecies = species;
			currentCxns = connections;
			currentNodes = nodes;
			nodeData = neat.fittestGenome.getNodes().map(({ type, id, level, activation }) => {
				return { type, id, label: level, activation };
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
			await new Promise((res) => setTimeout(res, vizDelay));
		}
	}

	function resetDemo() {
		currentGen = 0;
		currentHighFitness = 0;
		currentSpecies = 0;
		currentCxns = 0;
		currentNodes = 0;
		startGen = new Genome();
		startGen.addNode(new NodeGene(NodeType.INPUT, 0));
		startGen.addNode(new NodeGene(NodeType.INPUT, 1));
		startGen.addNode(new NodeGene(NodeType.HIDDEN, 2));
		startGen.addNode(new NodeGene(NodeType.OUTPUT, 3));
		startGen.addConnection(0, 2);
		startGen.addConnection(1, 2);
		startGen.addConnection(2, 3);

		neat = new Neat(
			startGen,
			(gen: Genome) => {
				const inputs = [
					[0, 1, 0, 1],
					[0, 0, 1, 1]
				];
				const labels = [0, 1, 1, 0];

				const outputTensor = TFGenome.toTFGraph(gen, inputs)[0];

				const mse = (preds, labels) => preds.sub(labels).square().mean();
				const fitness = -mse(outputTensor, tensor(labels)).dataSync()[0];

				return fitness;
			},
			$dropoff ? $dropoffAge : undefined
		);
	}

	$: vizDelay = 2500;
	$: if (neat && $enabled) runGen();

	onMount(resetDemo);

	$: if (neat && (($dropoff && $dropoffAge !== neat.dropoff) || !$dropoff)) resetDemo();
</script>

<div class="w-screen min-h-screen bg-hero-circuit-board-blue-30">
	<div class="appContent w-full">
		<div
			class="mt-10 w-full flex flex-wrap gap-10 items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
		>
			<div class="flex gap-4 w-full flex-col">
				<h3 class="text-center">NEAT: XOR Problem</h3>
				<div class="flex w-full flex-col gap-4 mb-10 items-center">
					<h4 class="text-center">Controls:</h4>
					<div class="grid md:grid-cols-2 gap-10 w-full justify-center mx-auto">
						<label class="inline-flex mx-auto gap-4 items-center">
							<span class="font-light text-blue-500 text-xl">vizDelay:</span>
							<input
								name="vizDelay_input"
								type="number"
								bind:value={vizDelay}
								min="100"
								max="10000"
							/>
							<input
								name="vizDelay_slider"
								type="range"
								bind:value={vizDelay}
								min="100"
								max="10000"
							/>
						</label>
						<label class="inline-flex mx-auto gap-4 items-center">
							<span class="font-light text-blue-500 text-xl">Demo Enabled:</span>
							<input name="enabled" type="checkbox" bind:checked={$enabled} />
						</label>
						<label class="inline-flex mx-auto gap-4 items-center">
							<div class="flex flex-col">
								<span class="font-light text-blue-500 text-xl">Use Dropoff:</span>
								<span class="text-xs font-light text-blue-500"
									>enabling/changing dropoffAge resets demo</span
								>
							</div>
							<input name="dropoff" type="checkbox" bind:checked={$dropoff} />
						</label>
						{#if $dropoff}
							<label class="inline-flex mx-auto gap-4 items-center">
								<div class="flex flex-col">
									<span class="font-light text-blue-500 text-xl">Dropoff Age:</span>
									<span class="text-xs font-light text-blue-500"
										># gens w/o progress drop species</span
									>
								</div>
								<input
									name="dropoffAge_input"
									type="number"
									bind:value={$dropoffAge}
									min="10"
									max="100"
								/>
								<input
									name="dropoffAge_slider"
									type="range"
									bind:value={$dropoffAge}
									min="10"
									max="100"
								/>
							</label>
						{/if}
					</div>
				</div>
				<div class="flex w-full flex-col gap-4 w-full justify-evenly">
					<div class="inline-flex gap-4 w-full justify-around items-center">
						<StatLabel title="Generation" value={currentGen.toString()} />
						<StatLabel title="Species" value={currentSpecies.toString()} />
					</div>
					<div class="flex flex-wrap gap-4 justify-around items-center">
						<StatLabel
							title="Best Fitness"
							subtitle="-MSE (Mean Squared Error)"
							value={currentHighFitness.toFixed(8)}
						/>
						<StatLabel title="Connections" value={currentCxns.toString()} />
						<StatLabel title="Nodes" value={currentNodes.toString()} />
					</div>
				</div>
			</div>
			<div class="flex w-full">
				<FDG nodes={nodeData} cxns={cxnData} />
			</div>
		</div>
	</div>
</div>
