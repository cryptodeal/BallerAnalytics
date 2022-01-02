<script lang="ts">
	import InputField from './InputField.svelte';
	import { getNotificationsContext } from 'svelte-notifications';
	import type { UserDocument } from '@balleranalytics/nba-api-ts';
	export let active_step;
	export let formData: UserDocument;
	const { addNotification } = getNotificationsContext();
	if (!formData.name) formData.name = {};
	const handleSubmit = () => {
		return fetch('/profile.json', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		}).then((res) => {
			console.log(res);
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
		<InputField label={'First Name'} bind:value={formData.name.first} />
		<InputField label={'Last Name'} bind:value={formData.name.last} />
		<InputField type="date" label={'Birthdate'} bind:value={formData.birthdate} />
	{:else if active_step == 'Subscriptions'}
		<InputField
			label={'Team Subscriptions'}
			type="select"
			bind:value={formData.subscriptions.teams}
		/>
		<InputField
			label={'Player Subscriptions'}
			type="select"
			bind:value={formData.subscriptions.players}
		/>
	{:else if active_step == 'Confirmation'}
		<div class="message">
			<button>Finish</button>
		</div>
	{/if}
</form>

<style>
	.message {
		text-align: center;
	}
</style>
