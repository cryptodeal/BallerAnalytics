<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Game2Object } from '@balleranalytics/nba-api-ts';
	export const logoModules = import.meta.globEager('../../lib/ux/teams/assets/logo-*.svelte');
	export const load: Load = async ({ fetch, url }) => {
		let apiUrl = `/games.json`;
		if (url.searchParams.has('date')) {
			const date = url.searchParams.get('date');
			apiUrl += `?date=${date}`;
		}

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
	// import { dailyGames } from '$lib/data/stores/games';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import GameEvent from '$lib/ux/games/GameEvent.svelte';
	import { DateInput } from 'date-picker-svelte';
	import darkMode from '$lib/data/stores/theme';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.tz.setDefault('America/New_York');

	export let games,
		min: Date,
		max: Date,
		estDate = dayjs(games[0].date).tz(),
		date = estDate.toDate();

	const format = 'MM-dd-yyyy';
	// $: console.log(min, max);
	$: minDate = new Date(min);
	$: maxDate = new Date(max);

	function loadGames() {
		const url = `/games.json?date=${dayjs(date).tz().format('YYYY-MM-DD')}`;
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
		class="flex items-center flex-col gap-4"
		style:--date-picker-background={$darkMode ? '#1b1e27' : '#ffffff'}
		style:--date-picker-foreground={$darkMode ? '#f7f7f7' : '#000000'}
	>
		<h1 class="text-dark-800 dark:text-light-200">
			Games: {dayjs(date).tz().format('MMM	D, YYYY')}
		</h1>

		<DateInput min={minDate} max={maxDate} bind:value={date} on:select={loadGames} {format} />
	</div>
	{#if games.length}
		{#each games as game}
			<GameEvent {game} {logoModules} />
		{/each}
	{:else}
		<div class="flex justify-center">
			<h1 class="text-dark-800 dark:text-light-200">No games found</h1>
		</div>
	{/if}
</div>
