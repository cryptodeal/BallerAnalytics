<script lang="ts">
	import { getContext } from 'svelte';
	import { browser } from '$app/env';
	import { usePlainTextSetup } from '../shared/usePlainTextSetup';
	import type { EditorRoot, IsReadOnly, ShowPlaceholder } from '../context';

	const editor: EditorRoot = getContext('lexical-editor');
	const showPlaceholder: ShowPlaceholder = getContext('show-placeholder');

	// $: if (browser) usePlainTextSetup(editor, initialEditorState);
</script>
