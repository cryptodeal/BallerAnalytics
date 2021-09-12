<script context="module">
	export async function load({ page }) {
		/*
    const url = `/api/auth/verify/${page.params.authToken}.json`;

    const res = await fetch(url);

		if (res) {
      const result = await res.json()
			return {
        props: {
          result
        }
      }
		}
	}
  */
		return {
			props: {
				token: `${page.params.authToken}`
			}
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	export let token;
	console.log(token);
	let authPromise;
	async function getAuthTokens() {
		let url = `/api/auth/verify/${token}.json`;
		let res = await fetch(url);
		let msg = await res.json();
		if (res.ok) {
			return msg;
		} else {
			throw new Error(msg);
		}
	}
	onMount(async () => {
		await getAuthTokens();
		goto('/profile');
	});
</script>

{#await authPromise}
	<p>...waiting</p>
{:then msg}
	<h1>Congrats; Login Successful!</h1>
	<h3>Please return to your original tab and reload page</h3>
	<p>{JSON.stringify(msg)}</p>
{:catch error}
	<p style="color: red">{error}</p>
{/await}
