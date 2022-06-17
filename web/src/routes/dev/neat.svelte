<script lang="ts">
	import FDG from '$lib/ux/dataviz/ForceDirectedGraph.svelte';
	import { Genome, Neat, NodeType, TFGenome } from '@balleranalytics/tf-neat';
	import { tensor } from '@tensorflow/tfjs';
	import { onMount } from 'svelte';
	import StatLabel from '$lib/ux/dataviz/StatLabel.svelte';
	import { writable } from 'svelte/store';

	let nodeData: { type: NodeType; id: number; label: number }[] = [],
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
		const evalFitness = (gen: Genome) => {
			const inputs = [
				[0, 1, 0, 1],
				[0, 0, 1, 1]
			];
			const labels = [0, 1, 1, 0];

			const outputTensor = TFGenome.toTFGraph(gen, inputs)[0];

			const mse = (preds, labels) => preds.sub(labels).square().mean();
			const fitness = -mse(outputTensor, tensor(labels)).dataSync()[0];

			return fitness;
		};

		neat = new Neat(
			{ input: 2, out: 1, maxHidden: 2 },
			evalFitness,
			$dropoff ? { dropoff: $dropoffAge } : {}
		);
	}

	$: vizDelay = 2500;
	$: if (neat && $enabled) runGen();

	onMount(resetDemo);

	$: if ((neat && $dropoff && $dropoffAge !== neat.dropoff) || (neat && !$dropoff)) resetDemo();
</script>

<div
	class="mt-10 w-full flex flex-wrap gap-10 items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
>
	<div class="flex gap-4 w-full flex-col">
		<h3 class="text-center">NEAT: XOR Problem</h3>
		<div class="flex w-full flex-col gap-4 mb-10 items-center">
			<h4 class="text-center">Controls:</h4>
			<div class="grid md:grid-cols-2 gap-10 w-full justify-center mx-auto">
				<div class="form-control justify-center gap-4 w-full max-w-xs">
					<label for="vizDelay" class="label justify-center">
						<span class="label-text text-center text-xl">vizDelay:</span>
					</label>
					<div class="inline-flex gap-4 items-center">
						<input
							type="number"
							id="vizDelay"
							name="vizDelay"
							bind:value={vizDelay}
							min="500"
							max="10000"
							class="form-field"
						/>
						<input
							type="range"
							id="vizDelay"
							name="vizDelay"
							bind:value={vizDelay}
							min="500"
							max="10000"
							class="range range-primary"
						/>
					</div>
				</div>
				<div class="form-control">
					<label for="enabled" class="label justify-center items-center gap-4 cursor-pointer">
						<span class="label-text text-xl">Demo Enabled:</span>
					</label>
					<div class="flex justify-center">
						<input
							id="enabled"
							name="enabled"
							type="checkbox"
							bind:checked={$enabled}
							class="checkbox checkbox-primary"
						/>
					</div>
				</div>

				<div class="form-control">
					<label for="dropoff" class="label justify-center items-center gap-4 cursor-pointer">
						<span class="label-text text-xl">Use Dropoff:</span>
					</label>
					<div class="flex justify-center">
						<input
							id="dropoff"
							name="dropoff"
							type="checkbox"
							bind:checked={$dropoff}
							class="checkbox checkbox-primary"
						/>
					</div>
				</div>

				{#if $dropoff}
					<div class="form-control justify-center gap-4 w-full max-w-xs">
						<label for="vizDelay" class="label justify-center">
							<span class="label-text text-center text-xl">Dropoff Age:</span>
						</label>
						<div class="inline-flex gap-4 items-center">
							<input
								type="number"
								id="dropoff"
								name="dropoffText"
								bind:value={$dropoffAge}
								min="5"
								max="100"
								class="form-field"
							/>
							<input
								type="range"
								id="dropoff"
								name="dropoffSlider"
								bind:value={$dropoffAge}
								min="5"
								max="100"
								class="range range-primary"
							/>
						</div>
						<label for="dropoff" class="label">
							<span class="label-text-alt text-xs"># gens w/o progress drop species</span>
						</label>
					</div>
				{/if}
			</div>
		</div>
		<div class="flex w-full flex-col gap-4 justify-evenly">
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
