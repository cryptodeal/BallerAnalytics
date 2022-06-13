<script lang="ts">
	import { camelize } from '$lib/functions/helpers';
	import { DateInput } from 'date-picker-svelte';
	import dayjs from 'dayjs';
	const min = dayjs().subtract(100, 'years').toISOString(),
		max = dayjs().toISOString(),
		closeOnSelection = true,
		format = 'MM-dd-yyyy';

	$: minDate = new Date(min);
	$: maxDate = new Date(max);

	export let value,
		label: string,
		type = 'text';

	$: if (type === 'date') {
		value = new Date();
	}

	function typeAction(node) {
		node.type = type;
	}
</script>

<div class="my-2 mx-0 text-left">
	<label class="font-semibold" for={camelize(label)}>{label}:</label>
	{#if type === 'date'}
		<DateInput {closeOnSelection} min={minDate} max={maxDate} bind:value {format} />
	{:else}
		<input class="form-field" use:typeAction id={camelize(label)} bind:value />
	{/if}
</div>
