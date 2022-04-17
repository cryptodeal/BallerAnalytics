import { writable, type Writable } from 'svelte/store';

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

export function Decorators(editorConfig: EditorOpts) {
	const editor: EditorRoot = writable<LexicalEditor>();
	const { set, update, subscribe } = editor;

	const setRoot = (root: HTMLElement) => {
		update((e) => {
			e.setRootElement(root);
			return e;
		});
	};

	return {
		editor,
		set,
		update,
		subscribe,
		setRoot
	};
}