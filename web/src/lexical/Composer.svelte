<script lang="ts">
	import './editor.css';
	import { createEditor } from 'lexical';
	import { setContext } from 'svelte';
	import { onMount } from 'svelte';
	import theme from './themes/example';

	export let initEditorOpts = {
		theme,
		onError(error) {
			throw error;
		},
		nodes: []
	};
	const editor = createEditor(initEditorOpts);

	let editableDiv: HTMLElement;

	setContext('editor', editor);

	onMount(() => {
		editor.setRootElement(editableDiv);
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

<style>
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
