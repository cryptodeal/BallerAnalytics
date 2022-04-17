<script lang="ts">
	import { getContext } from 'svelte';
	import { registerPlainText } from '@lexical/plain-text';
	import { mergeRegister } from '@lexical/utils';
	import type {
		EditorDecorators,
		LexicalState,
		EditorRoot,
		ShowPlaceholder,
		IsReadOnly
	} from '../context';
	const editor: EditorRoot = getContext('lexical-editor');
	const state: LexicalState = getContext('state');
	const readOnly: IsReadOnly = getContext('read-only');

	const showPlaceholder: ShowPlaceholder = getContext('can-use-placeholder');
	const decorators: EditorDecorators = getContext('decorators');
	$: if ($editor) mergeRegister(registerPlainText($editor));
	$: console.log('$showPlaceholder:', $showPlaceholder);
</script>

{#if $showPlaceholder}
	<slot name="placeholder">
		<div class="editor-placeholder">Enter some plain text...</div>
	</slot>
{:else}
	<slot name="content-editable" />
	{decorators}
{/if}

<style>
	.editor-placeholder {
		color: #999;
		overflow: hidden;
		position: absolute;
		text-overflow: ellipsis;
		top: 15px;
		left: 10px;
		font-size: 15px;
		user-select: none;
		display: inline-block;
		pointer-events: none;
	}
</style>
