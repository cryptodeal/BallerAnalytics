<script lang="ts">

	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import GameEvent from '$lib/ux/games/GameEvent.svelte';
	import { DateInput } from 'date-picker-svelte';
	import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';
  export let data: PageData
  let { games, min, max} = data;
  $: ({ games, min, max} = data) // so it stays in sync when `data` changes

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.tz.setDefault('America/New_York');


	let date = games.length ? dayjs(games[0].date).utc().tz().toDate() : dayjs().utc().tz().toDate();

	const closeOnSelection = true;

	const format = 'MM-dd-yyyy';
	$: minDate = new Date(min);
	$: maxDate = new Date(max);

	function loadGames() {
		const strDate = dayjs(date).utc().tz().format('YYYY-MM-DD');
		// console.log('client', strDate);
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
	title="NBA Games on {dayjs(date).tz().format('MMM	D, YYYY')}"
	description="Index of NBA Games and boxscore data from {dayjs(date).tz().format('MMM	D, YYYY')}."
/>

<div class="flex flex-col gap-10 w-full">
	<div class="mx-auto flex flex-col items-center gap-4">
		<h1 class="text-center">
			Games: {dayjs(date).tz().format('MMM	D, YYYY')}
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
	<div class="w-full gap-5 flex-grow mb-10">
		{#each games as game}
			<GameEvent {game} />
		{:else}
			<div class="flex justify-center">
				<h1 class="text-center">No games found</h1>
			</div>
		{/each}
	</div>
</div>
