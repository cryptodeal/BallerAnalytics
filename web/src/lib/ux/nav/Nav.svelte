<script lang="ts">
	import Hamburger from '$lib/ux/nav/Hamburger.svelte';
	import ThemeToggle from '$lib/ux/nav/ThemeToggle.svelte';
	import AuthButton from '$lib/ux/nav/AuthButton.svelte';
	import Logo from '$lib/ux/nav/Logo.svelte';
	import { onMount } from 'svelte';

	export let segment: string;

	let isVisible = false;

	onMount(() => {
		isVisible = true;
	});

	function toggleNav() {
		const navToggle = document.getElementsByClassName('toggleHidden');
		for (let i = 0; i < navToggle.length; i++) {
			navToggle.item(i)?.classList.toggle('hidden');
		}
	}
</script>

<nav
	class="fixed px-1 top-0 max-h-15 z-10 text-bold flex flex-wrap md:inline-flex md:items-center w-full justify-evenly bg-gray-400/20 backdrop-filter backdrop-blur-lg border-b border-gray-100 dark:border-gray-800"
>
	<div class="flex justify-start text-dark-700 dark:text-light-200 md:hidden" on:click={toggleNav}>
		<Hamburger />
	</div>
	<div class="flex w-4/5 px-5 md:w-1/3 md:px-1">
		<Logo {isVisible} {segment} />
	</div>

	<div
		class="toggleHidden px-2 hidden font-medium w-full text-right border-blue-900 md:flex md:flex-row md:w-1/3 md:gap-2 md:justify-center md:border-none"
	>
		<a
			sveltekit:prefetch
			href="/games"
			class="flex justify-end border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:w-auto md:text-center md:border-none dark:text-light-200"
			aria-current={segment === 'games' ? 'page' : undefined}
		>
			games
		</a>
		<a
			sveltekit:prefetch
			href="/players"
			class="flex justify-end border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:w-auto md:text-center md:border-none dark:text-light-200"
			aria-current={segment === 'players' ? 'page' : undefined}
		>
			players
		</a>
		<a
			sveltekit:prefetch
			href="/teams"
			class="flex justify-end border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:w-auto md:text-center md:border-none dark:text-light-200"
			aria-current={segment === 'teams' ? 'page' : undefined}
		>
			teams
		</a>
		<a
			sveltekit:prefetch
			href="/articles"
			class="flex justify-end border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:w-auto md:text-center md:border-none dark:text-light-200"
			aria-current={segment === 'articles' ? 'page' : undefined}
		>
			articles
		</a>
		<a
			sveltekit:prefetch
			href="/dev/neat"
			class="flex justify-end border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:w-auto md:text-center md:border-none dark:text-light-200"
			aria-current={segment === 'dev' ? 'page' : undefined}
		>
			NEAT
		</a>
	</div>

	<div class="toggleHidden w-full h-full hidden md:flex md:flex-row md:w-1/3">
		<div class="flex w-full justify-between md:justify-end">
			<ThemeToggle />
			<AuthButton />
		</div>
	</div>
</nav>
