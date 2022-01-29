<script lang="ts">
	import Hamburger from '$lib/ux/nav/Hamburger.svelte';
	import { session } from '$app/stores';
	import ThemeToggle from '$lib/ux/nav/ThemeToggle.svelte';
	import AuthButton from '$lib/ux/nav/AuthButton.svelte';
	export let segment: string;

	function toggleNav() {
		const navToggle = document.getElementsByClassName('toggle');
		for (let i = 0; i < navToggle.length; i++) {
			navToggle.item(i)?.classList.toggle('hidden');
		}
	}
</script>

<nav
	class="fixed min-h-10 px-1 top-0 left-0 right-0 z-10 text-bold flex flex-wrap md:(flex inline-flex items-center) w-full justify-evenly bg-gray-400 bg-opacity-20 backdrop-filter backdrop-blur-lg border-bottom-1 border-gray-100"
>
	<div
		class="flex justify-start text-dark-700 dark:text-light-200 md:(hidden)"
		on:click={toggleNav}
	>
		<Hamburger />
	</div>
	<div class="w-4/5 px-5 p-1 md:(flex justify-start w-1/3 px-2)">
		<img
			src="/logo.svg"
			alt="Baller Analytics Logo"
			class="flex my-1 antialiased bg-gray-300 backdrop-filter backdrop-blur-lg bg-opacity-30 p-1 rounded md:(h-10 w-auto)"
		/>
	</div>

	<div
		class="toggle px-2 hidden font-medium w-full text-right border-blue-900 md:(flex flex-row w-1/3 gap-4 justify-center border-none)"
	>
		<a
			href="/"
			class="flex justify-end border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:(w-auto text-center border-none) dark:text-light-200"
			aria-current={segment === '' ? 'page' : undefined}>home</a
		>
		<a
			sveltekit:prefetch
			href="/teams"
			class="flex justify-end border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:(w-auto text-center border-none) dark:text-light-200"
			aria-current={segment === 'teams' ? 'page' : undefined}
		>
			teams
		</a>
		<a
			sveltekit:prefetch
			href="/players"
			class="flex justify-end border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:(w-auto text-center border-none) dark:text-light-200"
			aria-current={segment === 'players' ? 'page' : undefined}
		>
			players
		</a>
		{#if $session.user}
			<a
				sveltekit:prefetch
				href="/profile"
				class="flex border-b-2 border-blue-900 my-1 uppercase text-dark-900 justify-end w-full md:(w-auto text-center border-none) dark:text-light-200"
				aria-current={segment === 'profile' ? 'page' : undefined}
			>
				profile
			</a>
		{/if}
	</div>

	<div
		class="toggle p-2 hidden w-full h-full flex inline-flex items-center justify-between md:(flex flex-row justify-end w-1/3)"
	>
		<ThemeToggle />
		<AuthButton />
	</div>
</nav>
