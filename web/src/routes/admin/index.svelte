<script context="module">
	export async function load({ fetch }) {
		const url = `/admin.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { games } = await res.json();
			return {
				props: {
					games
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script>
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import MissingDataCard from '$lib/admin/MissingDataCard.svelte';
	export let games;
	let start;
	let end;
</script>

<div class="h-40 md:(container mx-auto) p-4 m-2">
	<VirtualList items={games} bind:start bind:end let:item>
		<MissingDataCard {item} />
	</VirtualList>
	<span>Showing {start} to {end} of {games.length}</span>
</div>
