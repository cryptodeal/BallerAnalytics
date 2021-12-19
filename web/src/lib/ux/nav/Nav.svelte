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
	class="absolute p-2 top-0 z-10 text-bold flex flex-wrap w-full justify-evenly items-center bg-gray-400 bg-opacity-20 backdrop-filter backdrop-blur-lg border-bottom-1 border-gray-100"
>
	<div class="flex justify-start md:(hidden w-1/3)" on:click={toggleNav}>
		<Hamburger />
	</div>
	<div class="w-4/5 px-5 md:(flex justify-start w-1/3 px-2)">
		<img src="/logo.svg" alt="Baller Analytics Logo" class="flex my-1 md:(h-10 w-auto)" />
	</div>

	<div
		class="toggle hidden font-medium my-1 md:(flex flex-row w-1/3 justify-center border-none) w-full text-right border-t-2 border-blue-900"
	>
		<a
			href="/"
			class="block my-1 w-full text-dark-900 dark:text-light-200 md:(inline-block w-auto border-none) px-3 border-b-2 border-blue-900"
			>Home</a
		>
		<a
			sveltekit:prefetch
			href="/teams"
			class="block my-1 w-full text-dark-900 dark:text-light-200 md:(inline-block w-auto border-none) px-3 border-b-2 border-blue-900"
		>
			Teams
		</a>
		{#if $session.user}
			<a
				sveltekit:prefetch
				href="/profile"
				class="block my-1 text-dark-900 dark:text-light-200 text-right w-full md:(inline-block w-auto text-center m-auto border-none) px-3 border-b-2 border-blue-900"
			>
				Profile
			</a>
		{/if}
	</div>

	<div
		class="toggle hidden h-10 w-full flex inline-flex items-center text-dark-900 dark:text-light-200 md:(flex flex-row justify-end w-1/3)"
	>
		<ThemeToggle />
		{#if $session.user}
			<a class="rounded-lg font-medium p-2 md:(mx-2 w-auto)" href="/logout">logout</a>
		{:else}
			<button class="font-medium rounded-lg p-2 md:(mx-2 w-auto)">
				<Modal>
					<UserContent />
				</Modal>
			</button>
		{/if}
	</div>
</nav>
