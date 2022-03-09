<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Game2Object } from '@balleranalytics/nba-api-ts';
	export const logoModules = import.meta.globEager('../../lib/ux/teams/assets/logo-*.svelte');
	export const load: Load = async ({ fetch, url }) => {
		let apiUrl = `/games.json`;
		if (url.searchParams.has('date')) {
			const date = url.searchParams.get('date');
			apiUrl += `?date=${date}`;
		} else console.log('false; no date! :)');

		const res = await fetch(apiUrl);

		if (res.ok) {
			const { games, min, max }: { games: Game2Object[]; min: Date; max: Date } = await res.json();
			return {
				props: {
					games,
					min,
					max
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
	import { dailyGames } from '$lib/data/stores/games';
	import dayjs from 'dayjs';
	import GameEvent from '$lib/ux/games/GameEvent.svelte';
	import { DateInput } from 'date-picker-svelte';
	import darkMode from '$lib/data/stores/theme';
	export let games, min: Date, max: Date;
	let date = new Date();
	const format = 'MM-dd-yyyy';
	// $: console.log(min, max);
	// $: minDate = new Date(min);
	// $: maxDate = new Date(max);

	function loadGames() {
		const url = `/games.json?date=${dayjs(date).format('YYYY-MM-DD')}`;
		return fetch(url)
			.then((res) => res.json())
			.then((data) => {
				const { games: updatedGames } = data;
				games = updatedGames;
			});
	}
	// $: console.log(games);
</script>

<div class="appContent mb-10 h-full w-full">
	<div
		class="flex justify-center"
		style:--date-picker-background={$darkMode ? '#1b1e27' : '#ffffff'}
		style:--date-picker-foreground={$darkMode ? '#f7f7f7' : '#000000'}
	>
		<DateInput bind:value={date} on:select={loadGames} {format} />
		<!--<DateInput min={minDate} max={maxDate} bind:value={date} on:select={loadGames} {format} />-->
	</div>
	{#each games as game}
		<GameEvent {game} {logoModules} />
	{/each}
</div>
