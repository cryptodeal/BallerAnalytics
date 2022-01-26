<script lang="ts">
	import 'virtual:windi.css';
	import '../app.css';
	import { page } from '$app/stores';
	import Notifications from 'svelte-notifications';
	import Nav from '$lib/ux/nav/Nav.svelte';

	$: segment = $page.path.split('/')[1];
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

<div class="h-full">
	<Notifications>
		<Nav {segment} />
		<div class="h-full w-full overflow-auto">
			<slot />
		</div>
	</Notifications>
</div>
