<script lang="ts">
	import { camelize } from '$lib/functions/helpers';

	export let value,
		label: string,
		type = 'text';

	function typeAction(node) {
		node.type = type;
	}
</script>

<p class="my-2 mx-0 text-left">
	<label class="font-semibold" for={camelize(label)}>{label}:</label>
	<input
		class="w-full block text-right py-2 px-2 mt-2 rounded-sm border-1 glassmorphicBg"
		use:typeAction
		id={camelize(label)}
		bind:value
	/>
</p>
