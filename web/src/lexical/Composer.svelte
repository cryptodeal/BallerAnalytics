<script lang="ts">
	import './editor.css';
	import pkg from 'lexical';
	import { $canShowPlaceholderCurry as _canShowPlaceholderCurry } from '@lexical/text';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import theme from './themes/example';

	export let initEditorOpts = {
		theme,
		onError(error) {
			throw error;
		},
		nodes: []
	};

	const { createEditor } = pkg,
		editor = createEditor(initEditorOpts),
		decorators = writable<Record<string, any>>({}),
		can_show_placeholder = writable(true);

	let editableDiv: HTMLElement;

	setContext('editor', editor);
	setContext('decorators', decorators);
	setContext('can_show_placeholder', can_show_placeholder);

	onMount(() => {
		editor.setRootElement(editableDiv);
		editor.registerDecoratorListener((nextDecorators) => {
			decorators.set(nextDecorators);
		});
		editor.registerUpdateListener(({ editorState }) => {
			const isComposing = editor.isComposing();
			can_show_placeholder.set(editorState.read(_canShowPlaceholderCurry(isComposing)));
		});
	});
</script>

<div class="editor_container">
	<slot name="toolbar" />

	<div class="editor_doc_container">
		<div contenteditable="true" bind:this={editableDiv} class="doc_root" />
		<!-- slot for plugins -->
		<slot />
	</div>
</div>

<style lang="postcss">
	.editor_container {
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

	.doc_root {
		min-height: 150px;
		border: 0;
		resize: none;
		cursor: text;
		font-size: 15px;
		caret-color: rgb(5, 5, 5);
		display: block;
		position: relative;
		tab-size: 1;
		outline: 0;
		padding: 10px;
		overflow: auto;
		resize: vertical;
	}
</style>
