import { writable, derived } from 'svelte/store';
import { createEditor } from 'lexical';
import { $canShowPlaceholderCurry } from '@lexical/text';

import type { Readable, Writable } from 'svelte/store';
import type { LexicalEditor, EditorState, EditorThemeClasses, LexicalNode } from 'lexical';

export type EditorOpts = {
	namespace?: string;
	editorState?: EditorState;
	theme?: EditorThemeClasses;
	context?: unknown;
	parentEditor?: LexicalEditor;
	nodes?: LexicalNode[];
	onError: (error: Error) => void;
	disableEvents?: boolean;
	readOnly?: boolean;
};

export type EditorRoot = Writable<LexicalEditor>;
export type ShowPlaceholder = Readable<boolean>;
export type IsReadOnly = Readable<boolean>;

export function Editor(editorConfig: EditorOpts) {
	const editor: EditorRoot = writable<LexicalEditor>(createEditor(editorConfig));
	/* derived store boolean if should show placeholder */
	const canUsePlaceholder: ShowPlaceholder = derived<EditorRoot, boolean>(editor, ($editor) =>
		$canShowPlaceholderCurry($editor.isComposing())
	);
	/* derived store boolean if editor.isReadOnly(): boolean */
	const isReadOnly: IsReadOnly = derived<EditorRoot, boolean>(editor, ($editor) =>
		$canShowPlaceholderCurry($editor.isReadOnly())
	);
	const { set, update, subscribe } = editor;

	const setRoot = (root: HTMLElement) => {
		update((e) => {
			e.setRootElement(root);
			return e;
		});
	};

	return {
		editor,
		canUsePlaceholder,
		isReadOnly,
		set,
		update,
		subscribe,
		setRoot
	};
}
