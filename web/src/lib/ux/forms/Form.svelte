<script lang="ts">
	import InputField from './InputField.svelte';
	import { getNotificationsContext } from 'svelte-notifications';
	import type { mongoose } from '@balleranalytics/nba-api-ts';
	export let active_step: string;
	export let userId: mongoose.Types.ObjectId;
	export let myForm;
	export let firstName;
	export let lastName;
	export let birthdate;
	export let teamSubs;
	export let playerSubs;
	const { addNotification } = getNotificationsContext();

	const handleSubmit = (): Promise<void> => {
		const postData = {
			userId,
			name: {
				first: $firstName.value,
				last: $lastName.value
			},
			birthdate: $birthdate.value,
			subscriptions: {
				teams: $teamSubs.value,
				players: $playerSubs.value
			}
		};
		return fetch('/profile.json', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(postData)
		}).then((res) => {
			if (res.status === 200) {
				addNotification({
					text: `Success: Check Email for Auth Link`,
					position: 'top-right',
					type: 'success',
					removeAfter: 4000
				});
			} else {
				addNotification({
					text: `Error: Login Error; Please Try Again`,
					position: 'top-right',
					type: 'danger',
					removeAfter: 4000
				});
			}
		});
	};
</script>

<form class="glassmorphicBg rounded-lg py-10 px-5 text-center max-w-full" on:submit={handleSubmit}>
	{#if active_step == 'Info'}
		<InputField label={'First Name'} bind:value={$firstName.value} />
		<InputField label={'Last Name'} bind:value={$lastName.value} />
		<InputField type="date" label={'Birthdate'} bind:value={$birthdate.value} />
	{:else if active_step == 'Subscriptions'}
		<InputField label={'Team Subscriptions'} type="select" bind:value={$teamSubs.value} />
		<InputField label={'Player Subscriptions'} type="select" bind:value={$playerSubs.value} />
	{:else if active_step == 'Confirmation'}
		<div class="message">
			<button disabled={!$myForm.valid}>Finish</button>
		</div>
	{/if}
</form>

<style>
	.message {
		text-align: center;
	}
</style>
