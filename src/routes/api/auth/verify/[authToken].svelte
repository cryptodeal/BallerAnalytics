<script context="module">
	export async function load({ fetch, page }) {
		const url = `/api/auth/verify/${page.params.authToken}.json`;

		const res = await fetch(url);
		await res.json();
		if (res.ok) {
			return {
				props: {
					msg: res.msg
				}
			};
		}
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	export let msg;
	console.log(msg);

	onMount(() => {
		goto('/profile');
	});
</script>
