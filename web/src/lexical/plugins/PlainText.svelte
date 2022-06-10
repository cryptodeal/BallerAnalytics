<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { registerPlainText } from '@lexical/plain-text';
	import { registerDragonSupport } from '@lexical/dragon';
	import { mergeRegister } from '@lexical/utils';
	import Decorators from '$lexical/shared/Decorators.svelte';

	import type { LexicalEditor } from 'lexical';
	import type { Writable } from 'svelte/store';

	const editor: LexicalEditor = getContext('editor'),
		can_show_placeholder: Writable<boolean> = getContext('can_show_placeholder'),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		decorators: Writable<Record<string, any>> = getContext('can_show_placeholder');

	onMount(() => {
		mergeRegister(registerPlainText(editor), registerDragonSupport(editor));
	});
</script>

{#if $can_show_placeholder}
	<div class="h-full w-full bg-red-200">
		<slot name="placeholder">
			<span class="editor-placeholder">Enter some plain text...</span>
		</slot>
	</div>
{/if}
<Decorators decorators={$decorators} />

<style lang="postcss">
	.editor-placeholder {
		position: absolute;
		top: 10px;
		color: #999;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 15px;
		user-select: none;
		pointer-events: none;
	}
</style>
