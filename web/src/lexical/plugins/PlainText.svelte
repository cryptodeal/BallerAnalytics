<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { registerPlainText } from '@lexical/plain-text';
	import { $canShowPlaceholderCurry as _canShowPlaceholderCurry } from '@lexical/text';
	import type { LexicalEditor } from 'lexical';

	const editor: LexicalEditor = getContext('editor');
	let can_show_placeholder = true;
	// returns callback to unregister
	onMount(() => {
		registerPlainText(editor);
		editor.registerUpdateListener(({ editorState }) => {
			const isComposing = editor.isComposing();
			can_show_placeholder = editorState.read(_canShowPlaceholderCurry(isComposing));
		});
	});
</script>

{#if can_show_placeholder}
	<slot name="placeholder">
		<span class="editor-placeholder">Enter some plain text...</span>
	</slot>
{/if}

<style>
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
