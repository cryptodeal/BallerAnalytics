<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	export let title: string;
	export let data: string;

	$: formattedTitle = title.split(' ').map(capitalizeFirstLetter).join(' ');
</script>

<div class="bio text-dark-800 dark:text-light-200">
	<h5 class="text-dark-800 dark:text-light-200">{formattedTitle}:</h5>
	{data}
</div>

<style>
	.bio {
		@apply flex justify-evenly items-center;
	}
</style>
