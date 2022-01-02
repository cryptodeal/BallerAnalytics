<script lang="ts">
	import Form from '$lib/ux/forms/Form.svelte';
	import ProgressBar from '$lib/ux/forms/ProgressBar.svelte';
	import type { SvelteComponent } from 'svelte';
	import type { UserDocument } from '@balleranalytics/nba-api-ts';
	export let user: UserDocument;

	let steps = ['Info', 'Subscriptions', 'Confirmation'],
		currentActive = 1,
		progressBar: SvelteComponent;

	const handleProgress = (stepIncrement: number) => {
		progressBar.handleProgress(stepIncrement);
	};
</script>

<main>
	<div class="mx-auto">
		<ProgressBar {steps} bind:currentActive bind:this={progressBar} />

		<Form active_step={steps[currentActive - 1]} formData={user} />

		<div class="step-button">
			<button on:click={() => handleProgress(-1)} disabled={currentActive == 1}>Prev</button>
			<button on:click={() => handleProgress(+1)} disabled={currentActive == steps.length}
				>Next</button
			>
		</div>
	</div>
</main>

<style>
	@import url('https://fonts.googleapis.com/css?family=Muli&display=swap');

	* {
		box-sizing: border-box;
	}

	main {
		font-family: 'Muli', sans-serif;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		overflow: hidden;
		margin: 0;
	}

	button:active {
		@apply scale-98;
	}

	button:focus {
		outline: 0;
	}

	button:disabled {
		background-color: #e0e0e0;
		cursor: not-allowed;
	}

	.step-button {
		margin-top: 1rem;
		text-align: center;
	}
</style>
