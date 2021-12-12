<script context="module">
	export async function load({ fetch }) {
		const url = `/admin/linkPlayers.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { playerData } = await res.json();
			return {
				props: {
					playerData
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
	import PlayerCard from '$lib/admin/PlayerCard.svelte';
	export let playerData;
	let start;
	let end;
	//$: console.log(players)
</script>

<div class="h-80vh md:(container mx-auto) p-4 m-2">
	<VirtualList items={playerData} bind:start bind:end let:item>
		<PlayerCard {...item} />
	</VirtualList>
	<span>Showing {start} to {end} of {playerData.length}</span>
</div>
