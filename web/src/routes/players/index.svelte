<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';

	export const load: Load = async ({ fetch }) => {
		const url = `players.json`;
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
	import Headshot from '$lib/ux/img/Headshot.svelte';
	export let players: Player2Document[] = [];
	let page = 0;
	let listHeight: number;

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

<div class="h-full pt-12 w-full flex md:(container pt-14 mx-auto)">
	<div class="list glassmorphicBg" bind:offsetHeight={listHeight}>
		<VirtualList width="auto" height={listHeight} itemCount={players.length} itemSize={50}>
			<div
				slot="item"
				let:index
				let:style
				{style}
				class="flex inline-flex h-75px py-1 border-t-1 border-b-1 border-t-blue-600 border-b-blue-600"
			>
				<Headshot
					src="https://dttbvdi5lj1g6.cloudfront.net/{players[index].meta.images.headshot.avif[2]}"
					alt="{players[index].name.full} headshot"
				/>

				<h5 class="m-4 text-dark-600 dark:text-light-600">{players[index].name.full}</h5>
			</div>

			<div slot="footer">
				<InfiniteLoading on:infinite={loadPlayers} />
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
