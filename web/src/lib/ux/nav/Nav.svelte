<script lang="ts">
	import Hamburger from '$lib/ux/nav/Hamburger.svelte';
	import Modal from 'svelte-simple-modal';
	import UserContent from '$lib/ux/auth/modal/Content.svelte';
	import { session } from '$app/stores';
	import { browser } from '$app/env';
	import { theme } from '$lib/data/stores/theme';
	//$: console.log($session);
	function toggleNav() {
		const navToggle = document.getElementsByClassName('toggle');
		for (let i = 0; i < navToggle.length; i++) {
			navToggle.item(i)?.classList.toggle('hidden');
		}
	}

	let toggled: null | boolean = null;
	if (browser) {
		toggled = localStorage.getItem('theme') === 'dark' ? true : false;
	}

	const saveTheme = (mode, toggled) => {
		theme.set(mode);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		toggled = !!toggled;
	};

	const toggle = () => {
		if ($theme === 'dark') {
			document.documentElement.classList.remove('dark');
			saveTheme('light', toggled);
		} else {
			document.documentElement.classList.add('dark');
			saveTheme('dark', toggled);
		}
	};
</script>

<nav
	class="sticky top-0 z-10 flex flex-wrap items-center justify-between text-black bg-white bg-opacity-20 backdrop-opacity-20 backdrop-filter backdrop-blur-lg border-b border-gray-20"
>
	<img src="/logo.svg" alt="Baller Analytics Logo" width="200" />
	<div class="flex md:hidden" on:click={toggleNav}>
		<Hamburger />
	</div>
	<div
		class="toggle hidden md:(flex w-auto border-none) w-full text-right text-bold border-t-2 border-blue-900"
	>
		<a
			href="/"
			class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 border-b-2 border-blue-900"
			>Home</a
		>
		<a
			sveltekit:prefetch
			href="/teams"
			class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 border-b-2 border-blue-900"
			>Teams</a
		>

		<button
			class="navButton navSelect mx-2 hover:text-light-100 rounded-lg p-2 focus:outline-none"
			on:click={toggle}
		>
			{#if toggled !== null}
				{#if $theme === 'light'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						class="h-5 w-5"
						preserveAspectRatio="xMidYMid meet"
						viewBox="0 0 512 512"
						style=""
					>
						<path
							d="M256 387c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4v-46.2c0-8.5-6.9-15.4-15.4-15.4z"
							fill="currentColor"
						/><path
							d="M256 48c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4V63.4c0-8.5-6.9-15.4-15.4-15.4z"
							fill="currentColor"
						/>
						<path
							d="M125 256c0-8.5-6.9-15.4-15.4-15.4H63.4c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4z"
							fill="currentColor"
						/>
						<path
							d="M448.6 240.6h-46.2c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4s-6.9-15.4-15.4-15.4z"
							fill="currentColor"
						/>
						<path
							d="M152.5 344.1c-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5l32.7-32.7c6-6 6-15.8 0-21.8-2.9-2.9-6.8-4.5-10.9-4.5z"
							fill="currentColor"
						/>
						<path
							d="M359.5 167.9c4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5z"
							fill="currentColor"
						/>
						<path
							d="M130.7 108.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-2.9 2.9-4.5 6.8-4.5 10.9 0 4.1 1.6 8 4.5 10.9l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z"
							fill="currentColor"
						/>
						<path
							d="M370.4 348.6c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-6 6-6 15.8 0 21.8l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z"
							fill="currentColor"
						/>
						<path
							d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96z"
							fill="currentColor"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						class="h-5 w-5"
						preserveAspectRatio="xMidYMid meet"
						viewBox="0 0 24 24"
					>
						<path
							d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93a9.93 9.93 0 0 0 7.07-2.929a10.007 10.007 0 0 0 2.583-4.491a1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343a7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483a10.027 10.027 0 0 0 2.89 7.848a9.972 9.972 0 0 0 7.848 2.891a8.036 8.036 0 0 1-1.484 2.059z"
							fill="currentColor"
						/>
					</svg>
				{/if}
			{/if}
		</button>
		{#if $session.user}
			<a
				sveltekit:prefetch
				href="/profile"
				class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 border-b-2 border-blue-900"
				>Profile</a
			>
		{/if}
	</div>
	{#if $session.user}
		<a
			class="toggle hidden md:(flex w-auto rounded) w-full px-4 text-right bg-blue-900 hover:bg-blue-500 text-white"
			href="/logout">logout</a
		>
	{:else}
		<div
			class="toggle hidden rounded-lg md:(flex mx-2 w-auto rounded) h-full px-4 w-1/2 mx-auto text-right bg-blue-900 hover:bg-blue-500 text-white"
		>
			<Modal>
				<UserContent />
			</Modal>
		</div>
	{/if}
</nav>
