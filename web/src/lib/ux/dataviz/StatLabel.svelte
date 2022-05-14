<script lang="ts">
	export let title: string, value: string;
</script>

<div class="flex inline-flex gap-2 items-center">
	<h4>{title}:</h4>
	<span class="font-light text-2xl text-dark-800 dark:text-light-200">{value}</span>
</div>
