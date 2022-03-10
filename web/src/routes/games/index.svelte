<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Game2Document, PopulatedDocument } from '@balleranalytics/nba-api-ts';
	export const logoModules = import.meta.globEager('../../lib/ux/teams/assets/logo-*.svelte');
	export const load: Load = async ({ fetch, url }) => {
		let apiUrl = `/games.json`;
		if (url.searchParams.has('date')) {
			const date = url.searchParams.get('date');
			apiUrl += `?date=${date}`;
		}

		const res = await fetch(apiUrl);

		if (res.ok) {
			const {
				games,
				min,
				max
			}: {
				games: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>[];
				min: Date;
				max: Date;
			} = await res.json();
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
	import { MetaTags } from 'svelte-meta-tags';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.tz.setDefault('America/New_York');

	export let games: PopulatedDocument<
			PopulatedDocument<Game2Document, 'home.team'>,
			'visitor.team'
		>[],
		min: Date,
		max: Date;

	let date = dayjs.utc().toDate();

	const closeOnSelection = true;

	const format = 'MM-dd-yyyy';
	$: minDate = new Date(min);
	$: maxDate = new Date(max);

	function loadGames() {
		const strDate = dayjs.utc(date).format('YYYY-MM-DD');
		console.log('client', strDate);
		const url = `/games.json?date=${strDate}`;
		return fetch(url)
			.then((res) => res.json())
			.then((data) => {
				const { games: updatedGames } = data;
				games = updatedGames;
			});
	}
</script>

<MetaTags
	title="NBA Games on {dayjs.utc(date).tz().format('MMM	D, YYYY')}"
	description="Index of NBA Games and boxscore data from {dayjs
		.utc(date)
		.tz()
		.format('MMM	D, YYYY')}."
/>

<div class="appContent flex flex-col w-full">
	<div
		class="mx-auto flex flex-col items-center gap-4"
		style:--date-picker-background={$darkMode ? '#1b1e27' : '#ffffff'}
		style:--date-picker-foreground={$darkMode ? '#f7f7f7' : '#000000'}
	>
		<h1 class="text-dark-800 dark:text-light-200 text-center">
			Games: {dayjs.utc(date).tz().format('MMM	D, YYYY')}
		</h1>

		<DateInput
			{closeOnSelection}
			min={minDate}
			max={maxDate}
			bind:value={date}
			on:select={loadGames}
			{format}
		/>
	</div>
	<div class="w-full overflow-scroll flex-grow mb-10">
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
</div>
