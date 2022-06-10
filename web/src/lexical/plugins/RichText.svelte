<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { registerRichText } from '@lexical/rich-text';
	import { registerDragonSupport } from '@lexical/dragon';
	import { mergeRegister } from '@lexical/utils';
	import Decorators from '$lexical/shared/Decorators.svelte';

	import type { LexicalEditor } from 'lexical';
	import type { Writable } from 'svelte/store';

	const editor: LexicalEditor = getContext('editor'),
		can_show_placeholder: Writable<boolean> = getContext('can_show_placeholder'),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		decorators: Writable<Record<string, any>> = getContext('can_show_placeholder');

	onMount(() => {
		mergeRegister(registerRichText(editor), registerDragonSupport(editor));
	});
	// TODO: take care of decorators - useDecorators(editor)
</script>

{#if $can_show_placeholder}
	<slot name="placeholder">
		<span class="editor-placeholder">Enter some rich text...</span>
	</slot>
{/if}
<Decorators decorators={$decorators} />

<style lang="postcss">
	.editor-placeholder {
		color: #999;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 15px;
		user-select: none;
		display: inline-block;
		pointer-events: none;
	}
</style>
