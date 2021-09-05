<script>
	import { getContext } from 'svelte';
	import UserModal from '$lib/UserModal.svelte';

	const { open } = getContext('simple-modal');
	const showUserModal = () => {
		open(UserModal);
	};
</script>

<a class="w-full h-full " href={null} on:click={showUserModal}>login/register</a>
