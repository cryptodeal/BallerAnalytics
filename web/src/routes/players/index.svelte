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
	let listHeight: number;
	let listWidth: number;
	$: console.log(listWidth);

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

<div class="min-h-100vh overflow-scroll pt-12 w-full flex md:(container h-full pt-14 mx-auto)">
	<div class="list glassmorphicBg" bind:offsetHeight={listHeight} bind:offsetWidth={listWidth}>
		<VirtualList
			width="auto"
			height={listHeight}
			overscanCount={10}
			itemCount={players.length}
			itemSize={50}
		>
			<a
				slot="item"
				let:index
				let:style
				{style}
				sveltekit:prefetch
				href="/players/{players[index].meta.slug}"
				class="flex inline-flex w-full h-50px border-t-1 border-b-1 border-t-blue-600 border-b-blue-600"
			>
				<PlayerListItem player={players[index]} />
			</a>

			<div slot="footer">
				<InfiniteLoading on:infinite={loadPlayers} distance={200} />
			</div>
		</VirtualList>
	</div>
</div>

<style>
	.list {
		flex-grow: 1;
	}

	.list :global(.virtual-list-wrapper) {
		overflow: visible;
		overflow-x: hidden;
		white-space: nowrap;
	}
</style>
