<script lang="ts">
	import Hamburger from '$lib/ux/nav/Hamburger.svelte';
	import Modal from 'svelte-simple-modal';
	import UserContent from '$lib/ux/auth/modal/Content.svelte';
	import { session } from '$app/stores';
	import ThemeToggle from '$lib/ux/nav/ThemeToggle.svelte';

	function toggleNav() {
		const navToggle = document.getElementsByClassName('toggle');
		for (let i = 0; i < navToggle.length; i++) {
			navToggle.item(i)?.classList.toggle('hidden');
		}
	}
</script>

<nav
	class="absolute p-2 top-0 z-10 flex flex-wrap w-full items-center justify-between bg-gray-400 bg-opacity-20 backdrop-filter backdrop-blur-lg border-bottom-1 border-gray-100"
>
	<img src="/logo.svg" alt="Baller Analytics Logo" class="flex w-4/5 md:w-1/5" />

	<div class="flex m-auto right-0 md:hidden" on:click={toggleNav}>
		<Hamburger />
	</div>
	<div
		class="toggle hidden md:(flex w-auto m-auto border-none) w-full text-right text-bold border-t-2 border-blue-900"
	>
		<a
			href="/"
			class="block md:(inline-block m-auto border-none) text-dark-900 dark:text-light-200 px-3 border-b-2 border-blue-900"
			>Home</a
		>
		<a
			sveltekit:prefetch
			href="/teams"
			class="block md:(inline-block m-auto border-none) text-dark-900 dark:text-light-200 px-3 border-b-2 border-blue-900"
		>
			Teams
		</a>
		{#if $session.user}
			<a
				sveltekit:prefetch
				href="/profile"
				class="block md:(inline-block m-auto border-none) text-dark-900 dark:text-light-200 px-3 border-b-2 border-blue-900"
			>
				Profile
			</a>
		{/if}
		<ThemeToggle />
	</div>
	{#if $session.user}
		<a
			class="toggle hidden md:(flex w-auto rounded) text-dark-900 dark:text-light-200 w-full px-4 text-right bg-blue-900 hover:bg-blue-500"
			href="/logout">logout</a
		>
	{:else}
		<div
			class="toggle hidden rounded-lg md:(flex mx-2 w-auto rounded) text-dark-900 dark:text-light-200 h-full px-4 w-1/2 mx-auto text-right bg-blue-500 hover:bg-blue-500"
		>
			<Modal>
				<UserContent />
			</Modal>
		</div>
	{/if}
</nav>
