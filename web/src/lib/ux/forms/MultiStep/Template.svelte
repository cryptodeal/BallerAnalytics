<script lang="ts">
	import { form, field } from '../../../../../node_modules/svelte-forms';
	import { min, required } from '../../../../../node_modules/svelte-forms/validators';
	import { checkAge } from '$lib/functions/helpers';
	import Form from '$lib/ux/forms/MultiStep/Form.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import type { SvelteComponent } from 'svelte';
	import type { UserDocument } from '@balleranalytics/nba-api-ts';
	import dayjs from 'dayjs';
	export let user: UserDocument;
	if (!user.name) user.name = {};
	const { first, last } = user.name;
	const dateOfBirth = dayjs(user.birthdate || new Date()).format('YYYY-MM-DD');
	const { players, teams } = user.subscriptions;
	const firstName = field('firstName', first ? first : '', [required(), min(2)], {
		valid: false,
		checkOnInit: true,
		validateOnChange: true,
		stopAtFirstError: false
	});
	const lastName = field('lastName', last ? last : '', [required(), min(2)], {
		valid: false,
		checkOnInit: true,
		validateOnChange: true,
		stopAtFirstError: false
	});
	const birthdate = field(
		'birthdate',
		dateOfBirth ? dateOfBirth : new Date(),
		[required(), checkAge(18)],
		{
			valid: false,
			checkOnInit: true,
			validateOnChange: true,
			stopAtFirstError: false
		}
	);
	const playerSubs = field('playerSubs', players, [required()], {
		valid: false,
		checkOnInit: true,
		validateOnChange: true,
		stopAtFirstError: false
	});
	const teamSubs = field('teamSubs', teams, [required()], {
		valid: false,
		checkOnInit: true,
		validateOnChange: true,
		stopAtFirstError: false
	});
	let steps = ['Info', 'Subscriptions', 'Confirmation'],
		currentActive = 1,
		progressBar: SvelteComponent;

	$: myForm =
		steps[currentActive - 1] == 'Info'
			? form(firstName, lastName, birthdate)
			: steps[currentActive - 1] == 'Subscriptions'
			? form(playerSubs, teamSubs)
			: form(firstName, lastName, birthdate, playerSubs, teamSubs);

	const handleProgress = (stepIncrement: number) => {
		progressBar.handleProgress(stepIncrement);
	};
</script>

<main>
	<div class="mx-auto">
		<ProgressBar {steps} bind:currentActive bind:this={progressBar} />

		<Form
			active_step={steps[currentActive - 1]}
			userId={user._id}
			{myForm}
			{firstName}
			{lastName}
			{birthdate}
			{playerSubs}
			{teamSubs}
		/>

		<div class="step-button">
			<button
				class="btn"
				on:click={() => handleProgress(-1)}
				class:btn-disabled={currentActive == steps.length || !$myForm.valid}
			>
				Prev
			</button>
			<button
				class="btn"
				class:btn-disabled={currentActive == steps.length || !$myForm.valid}
				on:click={() => handleProgress(+1)}>Next</button
			>
		</div>
	</div>
</main>

<style lang="postcss">
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
		transform: scale(0.98);
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
