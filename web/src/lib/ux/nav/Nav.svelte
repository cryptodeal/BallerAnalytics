<script lang="ts">
	import Hamburger from '$lib/ux/nav/Hamburger.svelte';
	import Modal from 'svelte-simple-modal';
	import UserContent from '$lib/ux/auth/modal/Content.svelte';
	import { session } from '$app/stores';
	//$: console.log($session);
	function toggleNav() {
		const navToggle = document.getElementsByClassName('toggle');
		for (let i = 0; i < navToggle.length; i++) {
			navToggle.item(i)?.classList.toggle('hidden');
		}
	}
</script>

<nav
	class="sticky top-0 z-10 flex flex-wrap items-center justify-between text-black bg-white bg-opacity-10 backdrop-filter p-2 backdrop-blur-lg border-b border-gray-20"
>
	<img src="http://acmelogos.com/images/logo-1.svg" alt="ACME" width="120" />
	<div class="flex md:hidden" on:click={toggleNav}>
		<Hamburger />
	</div>
	<div
		class="toggle hidden md:(flex w-auto mt-0 border-none) w-full text-right text-bold mt-5 border-t-2 border-blue-900"
	>
		<a
			href="/"
			class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 py-3 border-b-2 border-blue-900"
			>Home</a
		>
		<a
			sveltekit:prefetch
			href="/teams"
			class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 py-3 border-b-2 border-blue-900"
			>Teams</a
		>
		{#if $session.user}
			<a
				sveltekit:prefetch
				href="/profile"
				class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 py-3 border-b-2 border-blue-900"
				>Profile</a
			>
		{/if}
	</div>
	{#if $session.user}
		<a
			class="toggle hidden md:(flex w-auto rounded) w-full px-4 py-2 text-right bg-blue-900 hover:bg-blue-500 text-white"
			href="/logout">logout</a
		>
	{:else}
		<div
			class="toggle hidden rounded-lg md:(flex mx-2 w-auto rounded) h-full px-4 mt-2 w-1/2 mx-auto py-2 text-right bg-blue-900 hover:bg-blue-500 text-white"
		>
			<Modal>
				<UserContent />
			</Modal>
		</div>
	{/if}
</nav>
