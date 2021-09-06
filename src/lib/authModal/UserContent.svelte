<script>
	import { getContext } from 'svelte';
	import Register from '$lib/authModal/Authenticate.svelte';

	const { open } = getContext('simple-modal');
	const showUserModal = () => {
		open(Register);
	};
</script>

<a class="w-full h-full " href={null} on:click={showUserModal}>login/register</a>
