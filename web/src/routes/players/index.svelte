<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { PlayersResponse } from './index.json';

	export const load: Load = async ({ fetch }) => {
		const url = `/players.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { players, seasons } = (await res.json()) as PlayersResponse;
			return {
				props: {
					players,
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
	import PlayerListItem from '$lib/ux/players/PlayerListItem.svelte';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';
	export let players: Player2Document[], seasons: number[];

	let page = 1,
		listHeight = 500,
		seasonYear = Math.max(...seasons),
		name: string;

	function loadPlayers({ detail: { loaded, complete, error } }) {
		if (!name || name.length < 2) {
			fetch(`players.json?page=${page}&year=${seasonYear}`)
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
		} else {
			fetch(`players.json?page=${page}&year=${seasonYear}&name=${name}`)
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
	}

	function loadSeason() {
		page = 0;
		if (!name || name === '' || name.length < 2) {
			fetch(`players.json?page=${page}&year=${seasonYear}`)
				.then((response) => response.json())
				.then((data) => {
					const { players: newPlayers } = data;
					if (newPlayers) {
						page += 1;
						players = newPlayers;
					}
				})
				.catch(Error);
		} else {
			fetch(`players.json?page=${page}&year=${seasonYear}&name=${name}`)
				.then((response) => response.json())
				.then((data) => {
					const { players: newPlayers } = data;
					if (newPlayers) {
						page += 1;
						players = newPlayers;
					}
				})
				.catch(Error);
		}
	}

	function nameQuery() {
		page = 0;
		if (name === '') {
			fetch(`players.json?page=${page}&year=${seasonYear}`)
				.then((response) => response.json())
				.then((data) => {
					const { players: newPlayers } = data;
					if (newPlayers) {
						page += 1;
						players = newPlayers;
					}
				})
				.catch(Error);
		} else if (name.length > 2) {
			fetch(`players.json?page=${page}&year=${seasonYear}&name=${name}`)
				.then((response) => response.json())
				.then((data) => {
					const { players: newPlayers } = data;
					if (newPlayers) {
						page += 1;
						players = newPlayers;
					}
				})
				.catch(Error);
		}
	}
</script>

<MetaTags
	title="NBA {seasonYear - 1}-{seasonYear.toString().slice(-2)} Season Players"
	description="Index of players from the {seasonYear - 1}-{seasonYear
		.toString()
		.slice(-2)} NBA season."
/>

<div class="listContainer flex flex-col gap-2">
	<div class="glassmorphicBg rounded-lg flex flex-col gap-2 p-2 w-full md:container md:mx-auto">
		<h2 class="text-dark-600 text-center dark:text-light-200">
			NBA {seasonYear - 1}-{seasonYear.toString().slice(-2)} Season Players
		</h2>
		<div class="flex flex-wrap gap-4 justify-start sm:justify-evenly">
			<div class="inline-flex items-center text-black gap-4">
				<label class="text-dark-600 dark:text-light-200 text-lg" for="season-select">
					Season:
				</label>

				<select type="select" id="season-select" bind:value={seasonYear} on:change={loadSeason}>
					{#each seasons as season}
						<option value={season}>{season}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-col">
				<div class="inline-flex gap-4 items-center">
					<label class="text-dark-600 dark:text-light-200 text-lg" for="name-search">
						Player Name:
					</label>
					<input type="text" id="name-search" bind:value={name} on:input={nameQuery} />
				</div>
				<div class="text-sm self-end text-dark-600 dark:text-light-200">
					Enter at least 3 characters
				</div>
			</div>
		</div>
	</div>
	{#if players.length}
		<div class="list h-9/10 w-full sm:container sm:mx-auto" bind:clientHeight={listHeight}>
			<VirtualList overscanCount={20} height={listHeight} itemCount={players.length} itemSize={75}>
				<a
					slot="item"
					let:index
					let:style
					{style}
					href="/players/{players[index].meta.slug}"
					class="inline-flex max-h-[75px] h-[75px] w-full border-t border-b border-t-blue-600 border-b-blue-600"
				>
					<PlayerListItem player={players[index]} />
				</a>

				<div slot="footer">
					<InfiniteLoading distance={300} on:infinite={loadPlayers} />
				</div>
			</VirtualList>
		</div>
	{:else}
		<h4 class="text-dark-600 m-10 text-center dark:text-light-200">No Results Found</h4>
	{/if}
</div>
