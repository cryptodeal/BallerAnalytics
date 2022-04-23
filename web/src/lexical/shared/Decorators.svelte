<script lang="ts">
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let decorators: Record<string, any> = {};
</script>

{#each Object.keys(decorators) as key}
	{@const decorator = decorators[key]}
	<div>
		{decorator}
	</div>
{/each}
