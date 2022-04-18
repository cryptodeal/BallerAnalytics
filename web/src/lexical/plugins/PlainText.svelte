<script lang="ts">
	import { getContext } from 'svelte';
	import pkgTxt from '@lexical/plain-text';
	import pkg from '@lexical/utils';
	import { placeholderCurryTest } from '$lexical/context';

	import type {
		EditorDecorators,
		EditorRoot,
		// ShowPlaceholder,
		EditorUpdates
	} from '../context';
	import { browser } from '$app/env';

	export let editableDiv: HTMLElement = undefined;

	const { mergeRegister } = pkg;
	const { registerPlainText } = pkgTxt;
	const editor: EditorRoot = getContext('lexical-editor');
	const state: EditorUpdates = getContext('state');
	// const showPlaceholder: ShowPlaceholder = getContext('can-use-placeholder');
	const decorators: EditorDecorators = getContext('decorators');
	$: console.log($state);
	$: if (browser && $editor && $state?.editorState)
		mergeRegister(registerPlainText($editor, $state?.editorState));
</script>

<div
	class="editor-input"
	contentEditable={!$editor?.isReadOnly() ? true : false}
	bind:this={editableDiv}
>
	{#if $editor && $state?.editorState?.read(placeholderCurryTest($editor.isComposing()))}
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
