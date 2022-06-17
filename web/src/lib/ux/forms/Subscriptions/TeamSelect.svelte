<script lang="ts">
	import MultiSelect, { type ObjectOption } from 'svelte-multiselect';
	import { teams } from '$lib/data/teams';
	import TeamSlot from './TeamSlot.svelte';
	import type { Writable } from 'svelte/store';
	const teamOptions = teams.map((t) => {
		return {
			label: t.name,
			value: t.id
		};
	});
	export let teamSubs: Writable<ObjectOption[]>;
</script>

<label for="teamSubs" class="text-lg font-bold text-center">Manage Team Subscriptions</label>
{#if teamOptions.length}
	<MultiSelect
		id="teamSubs"
		options={teamOptions}
		placeholder="Select teams..."
		bind:selected={$teamSubs}
	>
		<TeamSlot let:option {option} slot="selected" />
	</MultiSelect>
{/if}
