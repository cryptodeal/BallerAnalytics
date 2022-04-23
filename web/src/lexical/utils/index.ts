import { $isAtNodeEnd as _isAtNodeEnd } from '@lexical/selection';

export const getSelectedNode = (selection: any) => {
	const anchor = selection.anchor;
	const focus = selection.focus;
	const anchorNode = selection.anchor.getNode();
	const focusNode = selection.focus.getNode();
	if (anchorNode === focusNode) {
		return anchorNode;
	}
	const isBackward = selection.isBackward();
	if (isBackward) {
		return _isAtNodeEnd(focus) ? anchorNode : focusNode;
	} else {
		return _isAtNodeEnd(anchor) ? focusNode : anchorNode;
	}
};
