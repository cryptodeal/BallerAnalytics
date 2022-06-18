<script lang="ts">
	import MultiSelect, { type ObjectOption } from 'svelte-multiselect';
	import { getNotificationsContext } from 'svelte-notifications';
	import { teams } from '$lib/data/teams';
	import TeamSlot from './TeamSlot.svelte';
	import { writable, type Writable } from 'svelte/store';
	const teamOptions = teams.map((t) => {
		return {
			label: t.name,
			value: t.id
		};
	});
	export let teamSubs: Writable<ObjectOption[]> = writable([]),
		saveBtn = false;
	const { addNotification } = getNotificationsContext();

	const saveTeamSubs = () => {
		const postData = {
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
				addNotification({
					text: `Successfully update your data! :)`,
					position: 'top-right',
					type: 'success',
					removeAfter: 4000
				});
			} else {
				addNotification({
					text: `Error updating your data! :(`,
					position: 'top-right',
					type: 'danger',
					removeAfter: 4000
				});
			}
		});
	};
</script>

<label for="teamSubs" class="text-lg font-bold text-center">Manage Team Subscriptions</label>
<MultiSelect
	id="teamSubs"
	options={teamOptions}
	placeholder="Select teams..."
	bind:selected={$teamSubs}
>
	<TeamSlot let:option {option} slot="selected" />
</MultiSelect>
{#if saveBtn}
	<button class="btn" on:click={saveTeamSubs}>Save</button>
{/if}
