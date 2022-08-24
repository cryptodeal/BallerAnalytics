<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="appContent inline-flex w-full mx-auto">
	<div
		class="bg-dark-600 m-4 text-center bg-opacity-20 dark:(bg-white backdrop-filter backdrop-blur-lg bg-opacity-20) sm:(container mx-auto)"
	>
		<h2 class="text-red-500 p-2 mb-2">{$page.status}: {$page.error?.message}</h2>
	</div>
</div>
