<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let { url } = data;
  $: ({ url } = data); // so it stays in sync when `data` changes
  
	onMount(async () => {
		const res = await fetch(url);
		if (res.ok) {
			await res.json();
			window.location.href = '/profile';
		}
	});
</script>
