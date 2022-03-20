<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	export let title: string;
	export let data: string;

	$: formattedTitle = title.split(' ').map(capitalizeFirstLetter).join(' ');
</script>

<div class="font-bold text-dark-800 dark:text-light-200">{formattedTitle}:</div>

<div class="text-dark-800 dark:text-light-200">{data}</div>
