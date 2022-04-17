<script lang="ts">
	import './editor.css';
	import { Editor } from './context';
	import { setContext } from 'svelte';
	import { browser } from '$app/env';
	import theme from './themes/example';

	import type { LexicalEditor } from 'lexical';
	import type { Updater } from 'svelte/store';

	import type {
		EditorRoot,
		ShowPlaceholder,
		IsReadOnly,
		EditorDecorators,
		LexicalState
	} from './context';

	const initEditorOpts = {
		theme,
		onError(error) {
			throw error;
		},
		nodes: []
	};

	let editor: EditorRoot,
		editableDiv: HTMLElement,
		canUsePlaceholder: ShowPlaceholder,
		readOnly: IsReadOnly,
		decorators: EditorDecorators,
		state: LexicalState,
		setRoot: (root: HTMLElement) => void,
		update: (this: void, updater: Updater<LexicalEditor>) => void;

	function initEditor() {
		const tempRes = Editor(initEditorOpts);
		editor = tempRes.editor;
		canUsePlaceholder = tempRes.canUsePlaceholder;
		decorators = tempRes.decorators;
		readOnly = tempRes.isReadOnly;
		state = tempRes.state;
		setContext('init-config', tempRes.editorConfig);
		setRoot = tempRes.setRoot;
		update = tempRes.update;
		setContext('lexical-editor', editor);
		setContext('can-use-placeholder', canUsePlaceholder);
		setContext('read-only', readOnly);
		setContext('decorators', decorators);
		setContext('state', state);
	}

	$: if (browser) initEditor();

	// $: console.log($editor);

	$: if (editableDiv && $editor) {
		setRoot(editableDiv);
		$editor.setReadOnly($readOnly || false);
	}

	$: console.log($readOnly);
</script>

<div class="editor-container">
	<div class="editor-input" contentEditable={!$readOnly} bind:this={editableDiv}>
		<slot />
	</div>
</div>

<style>
	.editor-container {
		background: #fff;
		margin: 20px auto 20px auto;
		border-radius: 2px;
		max-width: 600px;
		color: #000;
		position: relative;
		line-height: 20px;
		font-weight: 400;
		text-align: left;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
	}

	.editor-input {
		min-height: 150px;
		resize: none;
		font-size: 15px;
		caret-color: rgb(5, 5, 5);
		position: relative;
		tab-size: 1;
		outline: 0;
		padding: 15px 10px;
		caret-color: #444;
	}
</style>
