<script lang="ts">
	import { onMount } from 'svelte';
	import paths from '$ml/basic.json?url';
	import type { GraphData } from '$lib/data/stores/types';
	import LineChart from '$lib/ux/dataviz/LineChart.svelte';
	import LoaderWorker from '$lib/functions/_worker/loader?worker';
	import type { AssetLoaderMessage } from '$lib/functions/_worker/types';
	let mse: GraphData, val_mse: GraphData, loss: GraphData, val_loss: GraphData, worker: Worker;

	onMount(async () => {
		const { trainingData, tfjs: model } = await import('$lib/data/stores/tfjs');
		trainingData.subscribe((value) => {
			const { mse: tMse, val_mse: vMse, loss: tLoss, val_loss: vLoss } = value;
			mse = tMse;
			val_mse = vMse;
			loss = tLoss;
			val_loss = vLoss;
		});
		worker = new LoaderWorker();

		worker.postMessage({ paths });

		worker.onmessage = (event: AssetLoaderMessage) => {
			const { data } = event;
			model.subscribe((v) => v.init(JSON.parse(new TextDecoder().decode(data))));

			worker.terminate();
		};
	});
</script>

<div class="appContent flex bg-hero-circuit-board-blue-30">
	<article class="flex-grow glassmorphicBg mx-1 rounded-md sm:(mx-auto p-10) p-2 prose lg:prose-xl">
		<h1>TensorFlow.js Meets Fantasy Basketball</h1>
		<h2>By: James Deal</h2>

		<p>
			Using historical fantasy stats, we can train a machine learning model to predict a player's
			average fantasy points per game using their season averages from the preceding year.
		</p>

		<p>
			We can leverage this wealth of historical data to provide users with unparalled insight into
			their fantasy basketball lineups/rosters as well as providing additional tips for
			transactions, trades, etc.
		</p>

		<p>
			This enables users to continually optimize their lineups with the latest data and AI models in
			near real time.
		</p>

		<p>Watch as a basic model is trained using an abbreviated dataset in real time below.</p>

		<div class="w-full h-120">
			<LineChart data={mse} xLabel="Epoch" yLabel="MSE" title="onEpochEnd MSE" />
		</div>

		<p>
			The above chart plots the Mean Squared Error (MSE) at the end of each training Epoch (round).
		</p>

		<p>
			While MSE provides some insight into how the model more closely fits our dataset with time, it
			doesn't show the whole picture as it's not representing the accuracy of the model when used to
			predict an outcome from data it hasn't previously encountered.
		</p>

		<p>
			When training a model, we split the dataset into a training set and a validation set. The
			validation set is used as a baseline for comparison for the model to make adjustments between
			each training Epoch.
		</p>

		<div class="w-full h-120">
			<LineChart data={val_mse} xLabel="Epoch" yLabel="MSE" title="onEpochEnd Val. MSE" />
		</div>

		<p>
			The above chart plots the Mean Squared Error (MSE) at the end of each training Epoch for the
			Validation Dataset.
		</p>

		<p>
			In Machine Learning, Loss is a metric used to provide a measure of how bad the model's
			prediction was on a single example. If the model's prediction is perfect, the loss is zero;
			the further from perfect, the further the loss is from zero.
		</p>

		<div class="w-full h-120">
			<LineChart data={loss} xLabel="Epoch" yLabel="Loss" title="onEpochEnd Loss" />
		</div>

		<p>The above chart plots the Loss at the end of each training Epoch.</p>

		<p>
			While Loss provides insight into the how bad any given prediction of model is, this isn't
			representative of the accuracy of the model as it's this loss value is calculated from the
			dataset used to train the model.
		</p>

		<p>
			We can plot the loss over time from the validation dataset in order to get a better idea of
			how bad (or, conversely, how good) each prediction of a model is.
		</p>

		<div class="w-full h-120">
			<LineChart data={val_loss} xLabel="Epoch" yLabel="Loss" title="onEpochEnd Val. Loss" />
		</div>
		<p>
			The above chart plots the Loss at the end of each training Epoch for the Validation Dataset.
		</p>

		<p>
			Ultimately, we can make improvements to the model by adjusting the data inputted to the model,
			the structure of the neural network itself, or by hypertuning the training parameters used by
			the model.
		</p>

		<p>
			N.B. the model running for this demo is a simplified version of the proprietary
			model/algorithm used by our premium subscribers and is not intended to produce lossless
			results, but demonstrate the technologies employed.
		</p>
	</article>
</div>
