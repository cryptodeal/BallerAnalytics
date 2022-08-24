<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	onMount(() => {
		session.set({});
		goto('/');
	});
</script>
