import type { EditorState } from 'lexical';

export type InitialEditorStateType = null | string | EditorState | (() => void);
