<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ fetch }) => {
		const url = `/api/auth/logout.json`;
		const res = await fetch(url);
		if (res.ok) {
			return {};
		}
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	onMount(() => {
		session.set({});
		goto('/');
	});
</script>
