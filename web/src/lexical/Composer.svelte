<script lang="ts">
	import './editor.css';
	import { Editor } from './context';
	import { setContext } from 'svelte';
	import { browser } from '$app/env';
	import theme from './themes/example';

	import type { LexicalEditor } from 'lexical';
	import { writable, type Updater } from 'svelte/store';

	import type {
		EditorRoot,
		ShowPlaceholder,
		IsReadOnly,
		EditorDecorators,
		EditorUpdates,
		LexicalUpdates
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
		state: EditorUpdates = writable(),
		setRoot: (root: HTMLElement) => void,
		update: (this: void, updater: Updater<LexicalEditor>) => void;

	function initEditor() {
		const tempRes = Editor(initEditorOpts);
		editor = tempRes.editor;
		setContext('init-config', tempRes.editorConfig);
		setRoot = tempRes.setRoot;
		update = tempRes.update;
		setContext('state', state);
	}

	$: if (browser) initEditor();

	// $: console.log($editor);

	$: if (editableDiv && $editor) {
		setRoot(editableDiv);
		$editor.setReadOnly($editor.isReadOnly() || false);
		$editor.registerUpdateListener((update: LexicalUpdates) => state.set(update));
	}
</script>

<div class="editor-container">
	<slot {editableDiv} />
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
