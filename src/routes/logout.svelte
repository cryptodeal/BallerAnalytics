<script context="module">
	export async function load({ fetch }) {
		await fetch('/api/auth/logout.json', {
			method: 'DELETE'
		});
	}
</script>

<script>
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		session.set({});
		goto('/');
	});
</script>

<h1>Logged out!</h1>
