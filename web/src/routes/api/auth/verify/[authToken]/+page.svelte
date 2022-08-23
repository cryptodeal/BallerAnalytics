<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ params }) => {
		const url = `/api/auth/verify/${params.authToken}.json`;

		/*const res = await fetch(url);
		if (res.ok) {
			await res.json();
			return {
				
        props: {
					msg: res.msg
        }
        
				status: 302,
				redirect: '/profile'
			};
		}*/

		return {
			props: {
				url
			}
		};
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	export let url: string;
	onMount(async () => {
		const res = await fetch(url);
		if (res.ok) {
			await res.json();
			window.location.href = '/profile';
		}
	});
</script>
