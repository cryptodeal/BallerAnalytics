<script lang="ts">
	import { getContext } from 'svelte';
	import Auth from '$lib/ux/auth/modal/Auth.svelte';

	const { open } = getContext('simple-modal');
	const showUserModal = () => {
		open(Auth);
	};
</script>

<div class="w-full h-full text-light-200 text-center cursor-pointer" on:click={showUserModal}>
	login/register
</div>
