<script context="module">
  export const ssr = false;
	export async function load({ fetch }) {
		const url = `/api/auth/logout.json`;
		const res = await fetch(url);
		if (res.ok) {
      await res.json();
			return {};
		}
	}
</script>

<script>
  import { onMount } from "svelte";
  import { session } from '$app/stores';
  import {goto} from '$app/navigation';
  onMount(() => {
    session.set({})
    goto('/')
  })
</script>
