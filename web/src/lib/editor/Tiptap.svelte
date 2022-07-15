<script lang="ts">
	import { onMount } from 'svelte';
	import StarterKit from '@tiptap/starter-kit';
	import cx from 'classnames';
	import { createEditor, EditorContent, type Editor } from 'svelte-tiptap';
	import type { Editor as CoreEditor } from '@tiptap/core';
	import type { Readable } from 'svelte/store';

	let editor: Readable<Editor>;

	onMount(() => {
		editor = createEditor({
			extensions: [StarterKit],
			editorProps: {
				attributes: {
					class:
						'prose min-h-[300px] max-h-[70vh] sm:max-h-[75vh] lg:max-h-[80vh] overflow-scroll prose-sm sm:prose md:container mx-auto border-2 border-black rounded-b-md p-3 outline-none'
				}
			},
			content: `Hello world!`
		});
	});

	const toggleHeading = (level: 1 | 2 | 3 | 4) => {
		return () => {
			($editor as unknown as CoreEditor).chain().focus().toggleHeading({ level }).run();
		};
	};
	const toggleBold = () => {
		($editor as unknown as CoreEditor).chain().focus().toggleBold().run();
	};
	const toggleItalic = () => {
		($editor as unknown as CoreEditor).chain().focus().toggleItalic().run();
	};
	const setParagraph = () => {
		($editor as unknown as CoreEditor).chain().focus().setParagraph().run();
	};
	const setBlockquote = () => {
		($editor as unknown as CoreEditor).chain().focus().setBlockquote().run();
	};

	$: isActive = (name: string, attrs = {}) =>
		($editor as unknown as CoreEditor).isActive(name, attrs);
</script>

{#if editor}
	<div
		class="prose prose-sm sm:prose md:container mx-auto border-black border-2 border-b-0 rounded-t-md p-2 flex"
	>
		<button
			on:click={toggleHeading(1)}
			class="btn btn-tiny btn-square"
			class:active={isActive('heading', { level: 1 })}
		>
			H1
		</button>
		<div class="btn-group">
			<input
				type="radio"
				name="options"
				data-title="h1"
				class="btn btn-ghost btn-square btm-sm"
				on:click={toggleHeading(1)}
				checked={isActive('heading', { level: 1 })}
			/>
			<input
				type="radio"
				name="options"
				data-title="h2"
				class="btn btn-ghost btn-square btm-sm"
				on:click={toggleHeading(2)}
				checked={isActive('heading', { level: 2 })}
			/>
			<input
				type="radio"
				name="options"
				data-title="h3"
				class="btn btn-ghost btn-square btm-sm"
				on:click={toggleHeading(3)}
				checked={isActive('heading', { level: 3 })}
			/>
			<input
				type="radio"
				name="options"
				data-title="h4"
				class="btn btn-ghost btn-square btm-sm"
				on:click={toggleHeading(4)}
				checked={isActive('heading', { level: 4 })}
			/>
		</div>
		<button
			class={cx('hover:bg-black hover:text-white w-7 h-7 rounded ml-1', {
				'bg-black text-white': isActive('bold')
			})}
			on:click={toggleBold}
		>
			B
		</button>
		<button
			class={cx('hover:bg-black hover:text-white w-7 h-7 rounded ml-1', {
				'bg-black text-white': isActive('italic')
			})}
			on:click={toggleItalic}
		>
			I
		</button>
		<button
			class={cx('hover:bg-black hover:text-white w-7 h-7 rounded ml-1', {
				'bg-black text-white': isActive('paragraph')
			})}
			on:click={setParagraph}
		>
			P
		</button>
	</div>
{/if}

<EditorContent editor={$editor} />
