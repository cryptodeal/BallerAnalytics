import { writable } from 'svelte/store';
import {
	createEditor,
	ElementNode,
	type IntentionallyMarkedAsDirtyElement,
	type NodeKey
} from 'lexical';
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
export type IsComposing = Readable<boolean>;
export type EditorDecorators = Writable<Record<string, ElementNode>>;
export type LexicalState = Readable<EditorState>;
export type LexicalUpdates = {
	tags: Set<string>;
	prevEditorState: EditorState;
	editorState: EditorState;
	dirtyLeaves: Set<NodeKey>;
	dirtyElements: Map<NodeKey, IntentionallyMarkedAsDirtyElement>;
	normalizedNodes: Set<NodeKey>;
};
export type EditorUpdates = Writable<LexicalUpdates>;

export function Editor(editorConfig: EditorOpts) {
	const editor: EditorRoot = writable<LexicalEditor>(createEditor(editorConfig));

	/* derived store returning editor decorators */
	let decoratorList: Record<string, ElementNode>;
	editor.subscribe((e) => {
		decoratorList = e.getDecorators<ElementNode>();
	});

	const decorators: EditorDecorators = writable<Record<string, ElementNode>>(decoratorList);
	const { set, update, subscribe } = editor;

	const setRoot = (root: HTMLElement) => {
		update((e) => {
			e.setRootElement(root);
			return e;
		});
	};

	return {
		editor,
		decorators,
		editorConfig,
		set,
		update,
		subscribe,
		setRoot
	};
}

export const placeholderCurryTest = $canShowPlaceholderCurry;
