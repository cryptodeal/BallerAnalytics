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
		LexicalUpdates,
		EditorChangeParams
	} from './context';

	const initEditorOpts = {
		theme,
		onError(error) {
			throw error;
		},
		nodes: []
	};
	function editorChangeHandler(params: EditorChangeParams) {
		const { onChange } = params;
		let { ignoreInitChange, ignoreSelectionChange } = params;
		if (!ignoreInitChange) ignoreInitChange = true;
		if (!ignoreSelectionChange) ignoreSelectionChange = false;
		if (onChange) {
			$editor.registerUpdateListener((update: LexicalUpdates) => {
				const { dirtyElements, dirtyLeaves, prevEditorState } = update;
				if (ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0) {
					return;
				}

				if (ignoreInitChange && prevEditorState.isEmpty()) {
					return;
				}

				onChange(update);
			});
		}
	}

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
		setContext('lexical-editor', editor);
		setContext('init-config', tempRes.editor);
		setRoot = tempRes.setRoot;
		update = tempRes.update;
		setContext('state', state);
	}

	$: if (browser) initEditor();

	// $: console.log($editor);

	$: if (editableDiv && $editor) {
		setRoot(editableDiv);
		$editor.setReadOnly($editor.isReadOnly() || false);
	}
</script>

<div class="editor-container">
	<slot {editableDiv} {editor} />
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
</style>
