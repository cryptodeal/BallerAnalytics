<script lang="ts">
	import { getContext } from 'svelte';
	import Auth from '$lib/ux/auth/modal/Auth.svelte';

	const { open } = getContext('simple-modal');
	const showUserModal = () => {
		open(Auth);
	};
</script>

<a class="w-full h-full" href="#null" on:click={showUserModal}>login/register</a>
