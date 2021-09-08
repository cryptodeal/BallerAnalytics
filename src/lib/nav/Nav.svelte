<script>
	import Hamburger from '$lib/nav/Hamburger.svelte';
	import Modal from 'svelte-simple-modal';
	import UserContent from '$lib/authModal/UserContent.svelte';
	import { session } from '$app/stores';
	const logout = async () => {
		await fetch('/api/auth/logout.json');
	};
	function toggleNav() {
		const navToggle = document.getElementsByClassName('toggle');
		for (let i = 0; i < navToggle.length; i++) {
			navToggle.item(i).classList.toggle('hidden');
		}
	}
</script>

<nav class="flex flex-wrap items-center justify-between p-5 bg-blue-200">
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
		<!--
		<a
			href="#"
			class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 py-3 border-b-2 border-blue-900"
			>Products</a
		>
		<a
			href="#"
			class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 py-3 border-b-2 border-blue-900"
			>Pricing</a
		>
		<a
			href="#"
			class="block md:(inline-block border-none) text-blue-900 hover:text-blue-500 px-3 py-3 border-b-2 border-blue-900"
			>Contact</a
		>
    -->
	</div>
	<div
		class="toggle hidden md:(flex w-auto rounded) w-full px-4 py-2 text-right bg-blue-900 hover:bg-blue-500 text-white"
	>
		{#if !$session.user}
			<Modal>
				<UserContent />
			</Modal>
		{:else}
			<button class="w-full h-full" on:click={logout}>logout</button>
		{/if}
	</div>
</nav>
