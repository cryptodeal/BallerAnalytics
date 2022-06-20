<script lang="ts">
	import { RichTextComposer } from 'svelte-lexical';
	import PlaygroundEditorTheme from '$lib/ux/lexical/PlaygroundEditorTheme';
	import { browser } from '$app/env';
	import { getContext, onMount } from 'svelte';
	onMount(() => console.log(getContext('editor')));
</script>

{#if browser}
	<RichTextComposer theme={PlaygroundEditorTheme} />
{/if}
