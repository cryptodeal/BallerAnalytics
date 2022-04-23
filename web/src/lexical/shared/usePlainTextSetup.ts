import { registerDragonSupport } from '@lexical/dragon';
import { registerPlainText } from '@lexical/plain-text';
import { mergeRegister } from '@lexical/utils';

import type { InitialEditorStateType } from './PlainRichTextUtils';
import type { LexicalEditor } from 'lexical';

export const usePlainTextSetup = (
	editor: LexicalEditor,
	initialEditorState?: InitialEditorStateType
): void => {
	mergeRegister(registerPlainText(editor, initialEditorState), registerDragonSupport(editor));
};
