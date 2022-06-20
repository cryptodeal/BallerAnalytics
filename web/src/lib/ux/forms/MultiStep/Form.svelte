<script lang="ts">
	import InputField from './InputField.svelte';
	import { getNotificationsStore } from '$lib/data/stores/notifications';
	import type { UserDocument } from '@balleranalytics/nba-api-ts';
	import TeamSelect from '../Subscriptions/TeamSelect.svelte';
	export let active_step: string;
	export let userId: UserDocument['_id'];
	export let myForm;
	export let consentTandC;
	export let firstName;
	export let lastName;
	export let birthdate;
	export let teamSubs;
	export let minAge = 18;

	const notifications = getNotificationsStore();

	const handleSubmit = (): Promise<void> => {
		const postData = {
			type: 'Add',
			consentTandC: $consentTandC.value,
			userId,
			name: {
				first: $firstName.value,
				last: $lastName.value
			},
			birthdate: $birthdate.value,
			teamSubs: $teamSubs.map((t) => t.value)
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
				notifications.success('Success: Check Email for Auth Link');
			} else {
				notifications.error('Error: Login Error; Please Try Again');
			}
		});
	};
</script>

<form
	class="glassmorphicBg flex flex-col justify-center gap-2 rounded-lg mx-auto py-10 px-5 text-center max-w-full"
	on:submit={handleSubmit}
>
	{#if active_step == 'Terms & Conditions'}
		<InputField
			label={'I have read and agree to the Terms & Conditions:'}
			type="checkbox"
			bind:value={$consentTandC.value}
		/>
		{#if $myForm.hasError('consentTandC.required')}
			<div class="text-error text-sm">Must agree to the terms and conditions</div>
		{/if}
	{:else if active_step == 'Info'}
		<InputField label={'First Name'} bind:value={$firstName.value} />
		{#if $myForm.hasError('firstName.required')}
			<div class="text-error text-sm">First name is required</div>
		{/if}
		{#if $myForm.hasError('firstName.min')}
			<div class="text-error text-sm">First name must be at least 2 characters</div>
		{/if}
		<InputField label={'Last Name'} bind:value={$lastName.value} />
		{#if $myForm.hasError('lastName.required')}
			<div class="text-error text-sm">Last name is required</div>
		{/if}
		{#if $myForm.hasError('lastName.min')}
			<div class="text-error text-sm">Last name must be at least 2 characters</div>
		{/if}
		<InputField type="date" label={'Birthdate'} bind:value={$birthdate.value} />
		{#if $myForm.hasError('birthdate.required')}
			<div class="text-error text-sm">Must be {minAge}+ to register</div>
		{/if}
		{#if $myForm.hasError('birthdate.min_age')}
			<div class="text-error text-sm">Must be {minAge}+ to register</div>
		{/if}
	{:else if active_step == 'Subscriptions'}
		<div class="flex gap-2 flex-col items-center pb-12">
			<TeamSelect {teamSubs} />
		</div>
	{:else if active_step == 'Confirmation'}
		<div class="message">
			<button disabled={!$myForm.valid}>Finish</button>
		</div>
	{/if}
</form>

<style lang="postcss">
	.message {
		text-align: center;
	}
</style>
