<script lang="ts">
	import { getContext } from 'svelte';
	import { $patchStyleText as _patchStyleText } from '@lexical/selection';
	import {
		$getSelection as _getSelection,
		$isRangeSelection as _isRangeSelection,
		LexicalEditor
	} from 'lexical';
	import Select from '$lexical/toolbar/shared/Select.svelte';
	import { fontSize } from '$lexical/context';
	const editor: LexicalEditor = getContext('editor');
	function updateFontSize(target) {
		const { value } = target;
		const styles = { 'font-size': value };
		editor.update(() => {
			const selection = _getSelection();
			if (_isRangeSelection(selection)) {
				_patchStyleText(selection, styles);
			}
		});
	}
</script>

<Select
	class="toolbar-item font-size"
	on:change={({ target }) => updateFontSize(target)}
	selectOpts={[
		'10px',
		'11px',
		'12px',
		'13px',
		'14px',
		'15px',
		'16px',
		'17px',
		'18px',
		'19px',
		'20px'
	]}
	id="font-size"
	bind:value={$fontSize}
/>
