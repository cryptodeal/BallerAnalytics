<script lang="ts">
	import { getContext } from 'svelte';
	import pkgTxt from '@lexical/plain-text';
	import pkg from '@lexical/utils';
	//import { placeholderCurryTest, type LexicalUpdates } from '$lexical/context';

	import type {
		EditorDecorators,
		EditorRoot,
		// ShowPlaceholder,
		EditorUpdates
	} from '../context';
	import { browser } from '$app/env';
	import type { EditorState } from 'lexical';

	export let editableDiv: HTMLElement = undefined,
		editor: EditorRoot = undefined;

	const { mergeRegister } = pkg;
	const { registerPlainText } = pkgTxt;
	let state: EditorState;
	// const showPlaceholder: ShowPlaceholder = getContext('can-use-placeholder');
	// const decorators: EditorDecorators = getContext('decorators');
	$: if ($editor) {
		console.log(true);
		/*
    $editor.registerUpdateListener((update: LexicalUpdates) => {
			const { dirtyElements, dirtyLeaves, prevEditorState, editorState } = update;
			console.log('update', update);
			if (editorState) state = editorState;
		});
    */
	}
</script>

<div
	class="editor-input"
	contentEditable={!$editor?.isReadOnly() ? true : false}
	bind:this={editableDiv}
>
	{#if $editor}
		<slot name="placeholder">
			<span class="editor-placeholder">Enter some plain text...</span>
		</slot>
	{/if}
</div>

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
