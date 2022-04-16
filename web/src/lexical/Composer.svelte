<script lang="ts">
	import { Editor, type EditorOpts, type EditorRoot } from './context/Editor';
	import { browser } from '$app/env';
	import theme from './themes/example';

	import type { LexicalEditor } from 'lexical';
	import type { Updater } from 'svelte/store';

	let editorDiv: HTMLDivElement,
		editor: EditorRoot,
		setRoot: (root: HTMLElement) => void,
		update: (this: void, updater: Updater<LexicalEditor>) => void;

	function initEditor() {
		const tempRes = Editor({ theme } as EditorOpts);
		editor = tempRes.editor;
		setRoot = tempRes.setRoot;
		update = tempRes.update;
	}

	$: if (browser) initEditor();

	$: if (editorDiv && editor) setRoot(editorDiv);
</script>

<div class="w-full h-full md:(container mx-auto)" bind:this={editorDiv} />
