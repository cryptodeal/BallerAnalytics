<script lang="ts">
	import darkMode from '$lib/data/stores/theme';
	import IconSun from '~icons/fluent/weather-sunny-24-regular';
	import IconMoon from '~icons/fluent/weather-moon-24-regular';
</script>

<button
	class="text-dark-900 p-1 rounded-md dark:text-light-200"
	on:click={() => ($darkMode = !$darkMode)}
>
	{#if $darkMode}
		<IconMoon class="h-6 w-6" />
	{:else}
		<IconSun class="h-6 w-6" />
	{/if}
</button>
