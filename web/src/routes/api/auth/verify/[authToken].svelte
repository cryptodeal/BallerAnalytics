<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = async ({ fetch, page }) => {
		const url = `/api/auth/verify/${page.params.authToken}.json`;

		const res = await fetch(url);
		if (res.ok) {
			await res.json();
			return {
				/*
        props: {
					msg: res.msg
        }
        */
				status: 302,
				redirect: '/profile'
			};
		}
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	//export let msg: string;
	onMount(() => {
		goto('/profile');
	});
</script>
