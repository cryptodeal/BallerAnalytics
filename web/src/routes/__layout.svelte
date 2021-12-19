<script lang="ts">
	import 'virtual:windi.css';
	import '../app.css';
	import Nav from '$lib/ux/nav/Nav.svelte';
	import Notifications from 'svelte-notifications';
	import { browser } from '$app/env';
	import { theme } from '$lib/data/stores/theme';
	if (browser) {
		theme.useLocalStorage();
	}
</script>

<svelte:head>
	<script>
		(function () {
			if (typeof document === 'undefined') return; // SSR
			if (
				localStorage.theme === 'dark' ||
				(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
			) {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		})();
	</script>
</svelte:head>

<div class="h-100vh w-100vw">
	<Notifications>
		<Nav />
		<div class="h-full w-full overflow-auto">
			<slot />
		</div>
	</Notifications>
</div>
