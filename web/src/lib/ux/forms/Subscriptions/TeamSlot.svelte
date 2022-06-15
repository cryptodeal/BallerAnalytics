<script lang="ts">
	export let option: string | number | ObjectOption;
	import { teams } from '$lib/data/teams';
	import type { ObjectOption } from 'svelte-multiselect';
	console.log(option);
	const teamData = teams[teams.findIndex((t) => t.name === (option as ObjectOption).value)];
	const { abbrev } = teamData;
</script>

<span style="display: flex; gap: 3pt;">
	{abbrev}
</span>
