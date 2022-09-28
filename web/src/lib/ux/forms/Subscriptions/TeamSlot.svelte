<script lang="ts">
	export let option: string | number | ObjectOption;
	import { teams } from '$lib/data/teams';
	import { browser } from '$app/environment';
	import type { ObjectOption } from 'svelte-multiselect';
	$: teamData = teams[teams.findIndex((t) => t.name === (option as ObjectOption).label)];
	$: abbrev = teamData.abbrev;
	$: name = teamData.name;
	$: slug = teamData.slug;
	const height = '20px',
		width = '20px';

	$: src = `/teams/assets/logo-${slug}.svg`;
	$: alt = `${name}'s logo`;

	let hidden = false;
	$: if (browser)
		fetch(src).then((resp) => {
			hidden = resp.status !== 200;
		});
</script>

<span style="display: flex; gap: 3pt;">
	{abbrev}
	<img {src} {height} {width} {alt} {hidden} />
</span>
