<script lang="ts">
	import { getContext } from 'svelte';

	import type { EditorRoot, IsReadOnly } from './context';

	const editor: EditorRoot = getContext('lexical-editor');
	const readOnly: IsReadOnly = getContext('read-only');

	export let ariaActiveDescendantID: string,
		ariaAutoComplete: string,
		ariaControls: string,
		ariaDescribedBy: string,
		ariaExpanded: boolean,
		ariaLabel: string,
		ariaLabelledBy: string,
		ariaMultiline: boolean,
		ariaOwneeID: string,
		ariaRequired: string,
		autoCapitalize: boolean,
		autoComplete: boolean,
		autoCorrect: boolean,
		className: string,
		id: string,
		role: string,
		spellCheck: boolean,
		style: StyleSheetList,
		tabIndex: number,
		testid: string;
</script>

<div
	class={className}
	contentEditable={!$readOnly}
	data-testid={testid}
	{id}
	role={$readOnly ? 'none' : role}
	{spellCheck}
	{tabIndex}
/>
