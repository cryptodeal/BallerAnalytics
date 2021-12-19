<script lang="ts">
	import 'virtual:windi.css';
	import '../app.css';
	import Notifications from 'svelte-notifications';
	import Nav from '$lib/ux/nav/Nav.svelte';
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
		<div class="w-full">
			<div class="h-100vh mx-2 pt-15 pn-3 overflow-scroll">
				<slot />
			</div>
		</div></Notifications
	>
</div>
