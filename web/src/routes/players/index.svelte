<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { PlayersResponse } from './index.json';

	export const load: Load = async ({ fetch }) => {
		const url = `/players.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { players, query, seasons } = (await res.json()) as PlayersResponse;
			return {
				props: {
					players,
					query,
					seasons
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
	import { MetaTags } from 'svelte-meta-tags';
	import InfiniteLoading from 'svelte-infinite-loading';
	import { browser } from '$app/env';
	import PlayerListItem from '$lib/ux/players/PlayerListItem.svelte';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';
	export let players: Player2Document[], seasons: number[], query: { year: number };
	$: console.log(query);

	let page = 1,
		listHeight = 500,
		seasonYear: number;

	$: if (browser) seasonYear = Math.max(...seasons);

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

<MetaTags
	title="NBA 2021-22 Season Players"
	description="Index of players from the 2021-22 NBA season."
/>

<div class="listContainer flex flex-col">
	<div class="glassmorphicCard h-10 pt-1">
		<div class="flex inline-flex items-center px-4 py-2 text-black mb-6">
			<div>
				<label class="text-dark-600 dark:text-light-200 text-lg mr-4" for="season-select">
					Season:
				</label>

				<select type="select" id="season-select" bind:value={seasonYear}>
					{#each seasons as season}
						<option value={season}>{season}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
	<div class="list h-9/10 w-full sm:(list container mx-auto)" bind:clientHeight={listHeight}>
		<VirtualList overscanCount={20} height={listHeight} itemCount={players.length} itemSize={75}>
			<a
				slot="item"
				let:index
				let:style
				{style}
				href="/players/{players[index].meta.slug}"
				class="flex inline-flex max-h-75px h-75px w-full border-t-1 border-b-1 border-t-blue-600 border-b-blue-600"
			>
				<PlayerListItem player={players[index]} />
			</a>

			<div slot="footer">
				<InfiniteLoading distance={300} on:infinite={loadPlayers} />
			</div>
		</VirtualList>
	</div>
</div>
