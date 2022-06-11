<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	export let title: string;
	export let data: string;

	$: formattedTitle = title.split(' ').map(capitalizeFirstLetter).join(' ');
</script>

<h6 class="font-bold">{formattedTitle}:</h6>

<div>{data}</div>
