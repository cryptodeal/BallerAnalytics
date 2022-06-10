<script lang="ts">
	export let title: string,
		value: string,
		subtitle: string = undefined;
</script>

<div class="inline-flex gap-2 items-center">
	<div class="flex flex-col">
		<h4>{title}:</h4>
		{#if subtitle}
			<span class="text-xs font-light text-blue-500">{subtitle}</span>
		{/if}
	</div>
	<span class="font-light text-2xl text-dark-800 dark:text-light-200">{value}</span>
</div>
