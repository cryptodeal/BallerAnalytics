<script lang="ts">
	import Composer from '$lexical/Composer.svelte';
	import RichText from '$lexical/plugins/RichText.svelte';
	// import BasicToolbar from '$lexical/toolbar/Basic.svelte';
</script>

<div class="w-screen min-h-screen">
	<div class="appContent w-full">
		<div
			class="mt-10 w-full flex flex-wrap items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:w-3/4 md:p-4 2xl:w-1/2"
		>
			<div class="w-full h-96 p-2">
				<Composer>
					<RichText />
				</Composer>
			</div>
		</div>
	</div>
</div>
