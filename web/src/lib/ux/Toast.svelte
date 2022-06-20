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
				class="{type === 'default' ? 'stroke-info' : 'stroke-current'} flex-shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
			>
				{#if type === 'default' || type === 'info'}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				{:else if type === 'success'}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				{:else if type === 'warning'}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				{:else}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				{/if}
			</svg>
			<span>{message}</span>
		</div>
	{/each}
</div>
