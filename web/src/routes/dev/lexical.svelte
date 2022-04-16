<script lang="ts">
	import Composer from '$lexical/Composer.svelte';
</script>

<div class="w-full min-h-screen bg-hero-circuit-board-blue-30">
	<div class="appContent w-full">
		<div
			class="mt-10 w-full flex flex-wrap items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
		>
			<div class="w-full h-100 p-2">
				<Composer />
			</div>
		</div>
	</div>
</div>
