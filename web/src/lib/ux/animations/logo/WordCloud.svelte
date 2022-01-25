<script>
	import { fade } from 'svelte/transition';
	export let isVisible = false;

	const wordClouds = 'Building Better,/Faster,/AI Driven,/Fan Fueled Analytics';
</script>

<div class="h-full w-full">
	{#if isVisible}
		<div class="font-light leading-relaxed text-4xl text-blue-500 md:(text-5xl)">
			{#each wordClouds.split('') as character, i}
				{#if character == '/'}
					<br />
				{:else}
					<span in:fade={{ delay: Math.random() * 2500 + 1000, duration: 150 }}>{character}</span>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	span {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
</style>
