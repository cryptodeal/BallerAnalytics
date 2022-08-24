<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

  /* TODO: FIX SESSION AS REMOVED IN LATEST API */
	import { session } from '$app/stores';
	onMount(() => {
		session.set({});
		goto('/');
	});
</script>
