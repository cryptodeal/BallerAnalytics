<script lang="ts">
	import { NeuralNetwork } from '@balleranalytics/tf-neat';
	import { onMount } from 'svelte';
	import dataPath from '$ml/basic.json?url';
	import { tfjs } from '$lib/data/stores/tfjs';
	import type { GraphData } from '$lib/data/stores/types';
	import LineChart from '$lib/ux/dataviz/LineChart.svelte';
	let mse: GraphData, val_mse: GraphData, loss: GraphData, val_loss: GraphData;

	tfjs.subscribe((value) => {
		const { mse: tMse, val_mse: vMse, loss: tLoss, val_loss: vLoss } = value;
		mse = tMse;
		val_mse = vMse;
		loss = tLoss;
		val_loss = vLoss;
	});

	const model = new NeuralNetwork({
		epochs: 100,
		batchSize: 10,
		callbacks: {
			onEpochEnd: async (epoch, logs) => {
				return tfjs.update((d) => {
					const { val_loss, val_mse, mse, loss } = logs;
					d.val_mse.push({ x: epoch, y: val_mse });
					d.val_loss.push({ x: epoch, y: val_loss });
					d.mse.push({ x: epoch, y: mse });
					d.loss.push({ x: epoch, y: loss });
					return d;
				});
			}
		}
	});

	onMount(async () => {
		tfjs.set({
			val_mse: [],
			val_loss: [],
			mse: [],
			loss: []
		});
		const data = await fetch(dataPath).then((res) => res.json());
		model.init(data);
	});
</script>

<div class="w-screen min-h-screen bg-hero-circuit-board-blue-30">
	<div class="appContent w-full">
		<div class="w-full p-2 grid grid-cols-1 gap-4 md:(grid-cols-2 gap-10)">
			<div class="mt-10 col-span-1 w-full items-center mx-auto p-2 h-100 rounded-lg glassmorphicBg">
				<LineChart data={mse} xLabel="Epoch" yLabel="MSE" title="onEpochEnd MSE" />
			</div>

			<div class="mt-10 col-span-1 w-full items-center mx-auto p-2 h-100 rounded-lg glassmorphicBg">
				<LineChart data={val_mse} xLabel="Epoch" yLabel="MSE" title="onEpochEnd Val. MSE" />
			</div>

			<div class="mt-10 col-span-1 w-full items-center mx-auto p-2 h-100 rounded-lg glassmorphicBg">
				<LineChart data={loss} xLabel="Epoch" yLabel="Loss" title="onEpochEnd Loss" />
			</div>

			<div class="mt-10 col-span-1 w-full items-center mx-auto p-2 h-100 rounded-lg glassmorphicBg">
				<LineChart data={val_loss} xLabel="Epoch" yLabel="Loss" title="onEpochEnd Val. Loss" />
			</div>
		</div>
	</div>
</div>
