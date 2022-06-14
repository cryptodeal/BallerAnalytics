<script lang="ts">
	import ThemeToggle from '$lib/ux/nav/ThemeToggle.svelte';
	import AuthButton from '$lib/ux/nav/AuthButton.svelte';
	import Logo from '$lib/ux/nav/Logo.svelte';
	import { onMount } from 'svelte';
	let isVisible = false;
	onMount(() => {
		isVisible = true;
	});

	export let segment: string, modalId: string, triggerTxt: string, closeDrawer: () => void;
</script>

<div
	class="sticky top-0 z-30 flex h-16 w-full justify-center bg-opacity-90 backdrop-blur transition-all duration-100 bg-base-100 text-base-content shadow-sm"
>
	<!-- Navbar -->
	<nav class="w-full navbar">
		<div class="flex-none lg:hidden">
			<label for="navDrawer" class="btn btn-square btn-ghost">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="inline-block w-6 h-6 stroke-current"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/></svg
				>
			</label>
		</div>
		<div class="w-3/4 justify-start lg:w-1/2">
			<Logo {isVisible} {segment} />
		</div>

		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal p-0">
				<!-- Navbar menu content here -->
				<li>
					<a
						sveltekit:prefetch
						href="/games"
						class="uppercase"
						class:active={segment === 'games' ? true : false}
					>
						games
					</a>
				</li>
				<li>
					<a
						sveltekit:prefetch
						href="/players"
						class="uppercase"
						class:active={segment === 'players' ? true : false}
					>
						players
					</a>
				</li>

				<li>
					<a
						sveltekit:prefetch
						href="/teams"
						class="uppercase"
						class:active={segment === 'teams' ? true : false}
					>
						teams
					</a>
				</li>

				<li>
					<a
						sveltekit:prefetch
						href="/articles"
						class="uppercase"
						class:active={segment === 'articles' ? true : false}
					>
						articles
					</a>
				</li>

				<li>
					<a
						sveltekit:prefetch
						href="/dev/neat"
						class="uppercase"
						class:active={segment === 'dev' ? true : false}
					>
						NEAT
					</a>
				</li>
			</ul>
		</div>
		<div class="navbar-end">
			<ThemeToggle />
			<div class="hidden lg:inline-flex">
				<AuthButton {modalId} {triggerTxt} {closeDrawer} />
			</div>
		</div>
	</nav>
</div>

<style lang="postcss">
	:root {
		--primary-light: #a6f9d6;
		--primary: #5be2a9;
		--primary-dark: #53ce9a;
		--secondary: #1e2145;
		--white: #fff;
		--grey: #e6e6ff;
		--grey-dark: #6d7098;
		--red: #ff6b6b;
	}
</style>
