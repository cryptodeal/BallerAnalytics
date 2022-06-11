<script lang="ts">
	export let title: string,
		value: string,
		subtitle: string = undefined;
</script>

<div class="inline-flex gap-2 items-center">
	<div class="flex flex-col">
		<h4>{title}:</h4>
		{#if subtitle}
			<span class="text-xs font-light">{subtitle}</span>
		{/if}
	</div>
	<span class="font-light text-2xl">{value}</span>
</div>
