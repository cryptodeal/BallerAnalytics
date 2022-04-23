<script lang="ts">
	import {
		$getRoot as _getRoot,
		$getSelection as _getSelection,
		$isElementNode as _isElementNode,
		$isGridSelection as _isGridSelection,
		$isRangeSelection as _isRangeSelection,
		$isTextNode as _isTextNode
	} from 'lexical';

	import type {
		EditorState,
		ElementNode,
		GridSelection,
		LexicalEditor,
		NodeSelection,
		RangeSelection
	} from 'lexical';

	const NON_SINGLE_WIDTH_CHARS_REPLACEMENT: Readonly<{
		[key: string]: string;
	}> = Object.freeze({
		'\t': '\\t',
		'\n': '\\n'
	});

	const NON_SINGLE_WIDTH_CHARS_REGEX = new RegExp(
		Object.keys(NON_SINGLE_WIDTH_CHARS_REPLACEMENT).join('|'),
		'g'
	);
	const SYMBOLS = Object.freeze({
		ancestorHasNextSibling: '|',
		ancestorIsLastChild: ' ',
		hasNextSibling: '├',
		isLastChild: '└',
		selectedChar: '^',
		selectedLine: '>'
	});
</script>
