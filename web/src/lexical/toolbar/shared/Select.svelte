<script lang="ts">
	export let selectOpts: string[] = [];
	export let id: string;
	let className: string;
	export { className as class };
	export let value: string;
</script>

<select class={className} type="select" {id} bind:value>
	{#each selectOpts as opt}
		<option value={opt}>{opt}</option>
	{/each}
</select>
