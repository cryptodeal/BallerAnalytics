<script lang="ts">
	import { form, field } from '../../../../../node_modules/svelte-forms';
	import { min, required } from '../../../../../node_modules/svelte-forms/validators';
	import { checkAge } from '$lib/functions/helpers';
	import Form from '$lib/ux/forms/MultiStep/Form.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import type { SvelteComponent } from 'svelte';
	import type { UserDocument, PopulatedDocument } from '@balleranalytics/nba-api-ts';
	import dayjs from 'dayjs';
	import { getTeamSubs } from '$lib/data/stores/teamSubs';
	export let user: PopulatedDocument<UserDocument, 'subscriptions.teams'>;
	if (!user.name) user.name = {};
	const { first, last } = user.name;
	const dateOfBirth = dayjs(user.birthdate || new Date()).format('YYYY-MM-DD');
	const { teams } = user.subscriptions;
	const consentTandC = field('consentTandC', false, [required(), min(2)], {
		valid: false,
		checkOnInit: true,
		validateOnChange: true,
		stopAtFirstError: false
	});
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
	const fmtTeams = teams.map((t) => {
		return {
			label: t.infoCommon.name,
			value: t.id.toString()
		};
	});
	const teamSubs = field('teamSubs', getTeamSubs().set(fmtTeams || []), [required()], {
		valid: false,
		checkOnInit: true,
		validateOnChange: true,
		stopAtFirstError: false
	});
	let steps = ['Terms & Conditions', 'Info', 'Subscriptions', 'Confirmation'],
		currentActive = 1,
		progressBar: SvelteComponent;

	$: myForm =
		steps[currentActive - 1] == 'Terms & Conditions'
			? form(consentTandC)
			: steps[currentActive - 1] == 'Info'
			? form(firstName, lastName, birthdate)
			: steps[currentActive - 1] == 'Subscriptions'
			? form(teamSubs)
			: form(consentTandC, firstName, lastName, birthdate, teamSubs);

	const handleProgress = (stepIncrement: number) => {
		progressBar.handleProgress(stepIncrement);
	};
</script>

<main>
	<div class="mx-auto sm:max-w-[50%] lg:max-w-[33%] 2xl:max-w-[25%]">
		<ProgressBar {steps} bind:currentActive bind:this={progressBar} />

		<Form
			active_step={steps[currentActive - 1]}
			userId={user._id}
			{myForm}
			{consentTandC}
			{firstName}
			{lastName}
			{birthdate}
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
