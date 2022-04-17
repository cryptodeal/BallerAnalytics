<script lang="ts">
	import './editor.css';
	import { Editor } from './context';
	import { setContext } from 'svelte';
	import { browser } from '$app/env';
	import theme from './themes/example';

	import type { LexicalEditor } from 'lexical';
	import type { Updater } from 'svelte/store';
	import type { EditorRoot, ShowPlaceholder, IsReadOnly } from './context';

	function onError(error: Error) {
		console.error(error);
	}

	let editorDiv: HTMLDivElement,
		editor: EditorRoot,
		canUsePlaceholder: ShowPlaceholder,
		readOnly: IsReadOnly,
		setRoot: (root: HTMLElement) => void,
		update: (this: void, updater: Updater<LexicalEditor>) => void;

	function initEditor() {
		const tempRes = Editor({ theme, onError });
		editor = tempRes.editor;
		canUsePlaceholder = tempRes.canUsePlaceholder;
		readOnly = tempRes.isReadOnly;
		setRoot = tempRes.setRoot;
		update = tempRes.update;
		setContext('lexical-editor', editor);
		setContext('can-use-placeholder', canUsePlaceholder);
		setContext('read-only', readOnly);
	}

	$: if (browser) initEditor();

	$: console.log($editor);

	$: if (editorDiv && editor) setRoot(editorDiv);
</script>

<div class="w-full h-full md:(container mx-auto)" bind:this={editorDiv} />
