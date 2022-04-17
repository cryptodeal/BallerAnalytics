<script lang="ts">
	import { getContext } from 'svelte';
	import { browser } from '$app/env';
	import type { EditorDecorators, EditorRoot } from '$lexical/context';

	const editor: EditorRoot = getContext('lexical-editor');
	const decorators: EditorDecorators = getContext('lexical-editor');

	function initDecorators() {
		$editor.registerDecoratorListener((nextDecorators) => {
			decorators.set(nextDecorators);
		});
	}

	$: if (browser) initDecorators();
</script>

{#each Object.keys($decorators) as key}
	{@const decorator = $decorators[key]}
	<div>
		{decorator}
	</div>
{/each}
