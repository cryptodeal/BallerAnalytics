<script context="module" lang="ts">
	import type { ErrorLoad } from '@sveltejs/kit';
	export const load: ErrorLoad = ({ error, status }) => {
		return {
			props: {
				title: `${status}: ${error.message}`
			}
		};
	};
</script>

<script lang="ts">
	export let title: string;
</script>

<div class="appContent inline-flex w-full mx-auto">
	<div
		class="bg-dark-600 m-4 text-center backdrop-filter backdrop-blur-lg bg-opacity-20 dark:(bg-white backdrop-filter backdrop-blur-lg bg-opacity-20) sm:(container mx-auto)"
	>
		<h2 class="text-red-500 p-2 mb-2">{title}</h2>
	</div>
</div>
