<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	// import Basketball from '$lib/ux/animations/hero/Hero.svelte';
	import Logo from '$lib/ux/Logo.svelte';
</script>

<div class="w-full h-full bg-hero-circuit-board-blue-30">
	<div class="appContent">
		<div
			class="w-full flex flex-col justify-center p-1 mt-5 glassmorphicBg rounded-md sm:(flex m-10 p-4 w-3/4 mx-auto) md:(w-1/2)"
		>
			<div class="w-full">
				<Logo />
			</div>
			<div class="w-full flex flex-wrap">
				<div class="flex flex-col w-full sm:w-1/2" />
			</div>
		</div>
	</div>
</div>
