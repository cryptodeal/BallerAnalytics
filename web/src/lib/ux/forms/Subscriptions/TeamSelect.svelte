<script lang="ts">
	import MultiSelect from 'svelte-multiselect';
	import { teams } from '$lib/data/teams';
	import TeamSlot from './TeamSlot.svelte';
	const logoModules = import.meta.globEager('../teams/assets/logo-*.svelte');
	const teamOptions = teams.map((t) => {
		return {
			label: t.name,
			value: t.name
		};
	});
	let teamSubs: string[];
</script>

<label for="teamSubs">Team Subscriptions</label>
{#if teamOptions.length}
	<MultiSelect
		id="teamSubs"
		options={teamOptions}
		placeholder="Select team subscriptions"
		bind:selected={teamSubs}
	>
		<TeamSlot let:option {option} slot="selected" />
	</MultiSelect>
{/if}
