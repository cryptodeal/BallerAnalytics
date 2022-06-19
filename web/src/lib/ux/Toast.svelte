<script lang="ts">
	import { getNotificationsStore } from '$lib/data/stores/notifications';
	import { fade } from 'svelte/transition';

	const notifications = getNotificationsStore();
	const typeClasses = {
		default: '',
		info: 'toast-info',
		success: 'toast-success',
		warning: 'toast-warning',
		error: 'toast-error'
	};
</script>

<div class="toast-control toast-control-top-right">
	{#each $notifications as { type, message }}
		<div in:fade out:fade class="toast {typeClasses[type]}">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="stroke-current flex-shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>{message}</span>
		</div>
	{/each}
</div>
