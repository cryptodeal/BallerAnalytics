<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';

	export const load: Load = async ({ fetch }) => {
		const url = `/players.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { players }: { players: Player2Document[] } = await res.json();
			return {
				props: {
					players
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	import VirtualList from 'svelte-tiny-virtual-list';
	import InfiniteLoading from 'svelte-infinite-loading';
	import PlayerListItem from '$lib/ux/players/PlayerListItem.svelte';
	export let players: Player2Document[] = [];
	let page = 1;
	let listHeight;

	function loadPlayers({ detail: { loaded, complete, error } }) {
		fetch(`players.json?page=${page}`)
			.then((response) => response.json())
			.then((data) => {
				const { players: newPlayers } = data;
				if (newPlayers.length) {
					page += 1;
					players = [...players, ...newPlayers];

					loaded();
				} else {
					complete();
				}
			})
			.catch(() => error());
	}
</script>

<svelte:head>
	<title>NBA 2021-22 Season Players</title>
	<html lang="en" />
	<meta name="Description" content="Index of players from the 2021-22 NBA season." />
</svelte:head>

<div class="listContainer flex flex-col">
	<div class="list h-full w-full sm:(container mx-auto)" bind:offsetHeight={listHeight}>
		<VirtualList overscanCount={10} height={listHeight} itemCount={players.length} itemSize={75}>
			<a
				slot="item"
				let:index
				let:style
				{style}
				sveltekit:prefetch
				href="/players/{players[index].meta.slug}"
				class="flex inline-flex max-h-75px h-75px w-full border-t-1 border-b-1 border-t-blue-600 border-b-blue-600"
			>
				<PlayerListItem player={players[index]} />
			</a>

			<div slot="footer">
				<InfiniteLoading distance={200} on:infinite={loadPlayers} />
			</div>
		</VirtualList>
	</div>
</div>

<style>
	@media (max-width: 768px) {
		.listContainer {
			height: 100%;
			padding-top: 3rem;
			margin-bottom: 1rem;
		}
	}

	.listContainer {
		height: 100%;
		padding-top: 3.2rem;
	}
</style>
