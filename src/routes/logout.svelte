<script context="module">
	export async function load({ fetch }) {
		const url = `/api/auth/logout.json`;
		const res = await fetch(url);
		if (res.ok) {
			return {};
		}
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	onMount(() => {
		session.set({});
		goto('/');
	});
</script>
