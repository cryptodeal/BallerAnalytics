<script lang="ts">
	import Hamburger from '$lib/ux/nav/Hamburger.svelte';
	import Modal from 'svelte-simple-modal';
	import UserContent from '$lib/ux/auth/modal/Content.svelte';
	import { session } from '$app/stores';
	import ThemeToggle from '$lib/ux/nav/ThemeToggle.svelte';

	export let segment: string;

	function toggleNav() {
		const navToggle = document.getElementsByClassName('toggle');
		for (let i = 0; i < navToggle.length; i++) {
			navToggle.item(i)?.classList.toggle('hidden');
		}
	}
</script>

<nav
	class="absolute p-2 top-0 z-10 text-bold flex flex-wrap w-full justify-evenly bg-gray-400 bg-opacity-20 backdrop-filter backdrop-blur-lg border-bottom-1 border-gray-100"
>
	<div
		class="flex justify-start text-dark-700 dark:text-light-200 md:(hidden w-1/3)"
		on:click={toggleNav}
	>
		<Hamburger />
	</div>
	<div class="w-4/5 px-5 md:(flex justify-start w-1/3 px-2)">
		<img
			src="/logo.svg"
			alt="Baller Analytics Logo"
			class="flex my-1 antialiased md:(h-10 w-auto)"
		/>
	</div>

	<div
		class="toggle hidden font-medium my-1 md:(flex flex-row w-1/3 justify-center border-none) w-full text-right border-t-2 border-blue-900"
	>
		<a
			href="/"
			class="flex justify-end mx-1 border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:(w-auto text-center border-none) dark:text-light-200"
			aria-current={segment === '' ? 'page' : undefined}>home</a
		>
		<a
			sveltekit:prefetch
			href="/teams"
			class="flex justify-end mx-1 border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:(w-auto text-center border-none) dark:text-light-200"
			aria-current={segment === 'teams' ? 'page' : undefined}
		>
			teams
		</a>
		{#if $session.user}
			<a
				sveltekit:prefetch
				href="/profile"
				class="flex mx-1 border-b-2 border-blue-900 my-1 uppercase text-dark-900 text-right w-full md:(w-auto text-center border-none) dark:text-light-200"
				aria-current={segment === 'profile' ? 'page' : undefined}
			>
				profile
			</a>
		{/if}
	</div>

	<div
		class="toggle hidden h-10 w-full flex inline-flex items-center justify-between text-dark-900 dark:text-light-200 md:(flex justify-end w-1/3)"
	>
		<ThemeToggle />

		<button class="font-medium uppercase rounded-lg p-2 md:(mx-2 w-auto)">
			{#if $session.user}
				<a href="/logout">logout</a>
			{:else}
				<Modal>
					<UserContent />
				</Modal>
			{/if}
		</button>
	</div>
</nav>
