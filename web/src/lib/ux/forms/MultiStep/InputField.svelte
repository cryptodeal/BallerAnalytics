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

<div class="form-control w-full max-w-xs">
	<label for={label} class="label cursor-pointer gap-4">
		<span class="label-text">{label}</span>
	</label>
	{#if type === 'date'}
		<DateInput {closeOnSelection} min={minDate} max={maxDate} bind:value {format} />
	{:else if type === 'checkbox'}
		<input class="checkbox checkbox-primary" id={label} name={label} type="checkbox" bind:value />
	{:else}
		<input class="form-field" use:typeAction id={camelize(label)} bind:value />
	{/if}
</div>
