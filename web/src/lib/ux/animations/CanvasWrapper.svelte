<script lang="ts">
	import { Canvas } from 'svelte-cubed';
	import { TroisProvider } from 'svelte-trois';
	import Bball from '$lib/ux/animations/Basketball.svelte';

	let width, height;
</script>

<div class="basicContainer" bind:clientHeight={height} bind:clientWidth={width}>
	<Canvas
		antialias
		physicallyCorrectLights={true}
		alpha={true}
		background={null}
		{height}
		{width}
		failIfMajorPerformanceCaveat={true}
	>
		<TroisProvider>
			<Bball />
		</TroisProvider>
	</Canvas>
</div>
