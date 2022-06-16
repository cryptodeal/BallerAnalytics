<script lang="ts">
	export let option: string | number | ObjectOption;
	import { teams } from '$lib/data/teams';
	import type { ObjectOption } from 'svelte-multiselect';
	const teamData = teams[teams.findIndex((t) => t.name === (option as ObjectOption).label)];
	const { abbrev, slug, name } = teamData;
	const height = '20px',
		width = '20px';

	$: src = `/teams/assets/logo-${slug}.svg`;
	$: alt = `${name}'s logo`;

	let hidden = false;
	$: fetch(src).then((resp) => {
		hidden = resp.status !== 200;
	});
</script>

<span style="display: flex; gap: 3pt;">
	{abbrev}
	<img {src} {height} {width} {alt} {hidden} />
</span>
