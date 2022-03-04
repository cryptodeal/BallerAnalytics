<script lang="ts">
	import 'virtual:windi.css';
	import '../app.css';
	import { page } from '$app/stores';
	import Notifications from 'svelte-notifications';
	import Nav from '$lib/ux/nav/Nav.svelte';
	import { dailyGames } from '$lib/data/stores/games';
	import Ticker from '$lib/ux/Ticker/Ticker.svelte';
	import TickerGame from '$lib/ux/Ticker/Game.svelte';
	$: segment = $page.url.pathname.split('/')[1];
</script>

<svelte:head>
	<script>
		(function () {
			if (typeof document === 'undefined') return; // SSR
			if (
				localStorage.theme === 'dark' ||
				(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
			) {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		})();
	</script>
</svelte:head>

<Notifications>
	<Nav {segment} />
	<slot />
	{#if Object.values($dailyGames).length}
		<div
			class="ticker bg-white backdrop-filter backdrop-blur-lg bg-opacity-80 dark:(bg-gray-500 backdrop-filter backdrop-blur-lg bg-opacity-80)"
		>
			<Ticker behavior="always">
				{#each Object.values($dailyGames).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as game}
					<TickerGame {game} />
				{/each}
			</Ticker>
		</div>
	{/if}
</Notifications>

<style>
	.ticker {
		width: 100vw;
		overflow: hidden;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
	}
</style>
