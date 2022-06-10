<script lang="ts">
	import ThemeToggle from '$lib/ux/nav/ThemeToggle.svelte';
	import AuthButton from '$lib/ux/nav/AuthButton.svelte';
	import Logo from '$lib/ux/nav/Logo.svelte';
	import { onMount } from 'svelte';
	let isVisible = false;
	onMount(() => {
		isVisible = true;
	});

	export let segment: string, modalId: string, triggerTxt: string;
</script>

<!-- Navbar -->
<div class="w-full navbar fixed top-0 min-h-6 z-10 bg-gray-400/20 backdrop-filter backdrop-blur-lg">
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
		<ul class="menu menu-horizontal">
			<!-- Navbar menu content here -->
			<li>
				<a
					sveltekit:prefetch
					href="/games"
					class="uppercase"
					aria-current={segment === 'games' ? 'page' : undefined}
				>
					games
				</a>
			</li>
			<li>
				<a
					sveltekit:prefetch
					href="/players"
					class="uppercase"
					aria-current={segment === 'players' ? 'page' : undefined}
				>
					players
				</a>
			</li>

			<li>
				<a
					sveltekit:prefetch
					href="/teams"
					class="uppercase"
					aria-current={segment === 'teams' ? 'page' : undefined}
				>
					teams
				</a>
			</li>

			<li>
				<a
					sveltekit:prefetch
					href="/articles"
					class="uppercase"
					aria-current={segment === 'articles' ? 'page' : undefined}
				>
					articles
				</a>
			</li>

			<li>
				<a
					sveltekit:prefetch
					href="/dev/neat"
					class="uppercase"
					aria-current={segment === 'dev' ? 'page' : undefined}
				>
					NEAT
				</a>
			</li>
		</ul>
	</div>
	<div class="navbar-end">
		<ThemeToggle />
		<div class="hidden lg:inline-flex">
			<AuthButton {modalId} {triggerTxt} />
		</div>
	</div>
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
