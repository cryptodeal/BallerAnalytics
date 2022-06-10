<script lang="ts">
	import darkMode from '$lib/data/stores/theme';
	import IconSun from '~icons/fluent/weather-sunny-24-regular';
	import IconMoon from '~icons/fluent/weather-moon-24-regular';
</script>

<button class="btn p-2 rounded-md" on:click={() => ($darkMode = !$darkMode)}>
	{#if $darkMode}
		<IconMoon class="h-5 w-5" />
	{:else}
		<IconSun class="h-5 w-5" />
	{/if}
</button>
