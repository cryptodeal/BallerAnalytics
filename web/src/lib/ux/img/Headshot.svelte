<script lang="ts">
	export let src: string;
	export let alt: string;
	function handleError(e: Event) {
		console.log('error:', e); // This never happen even when src is invalid
		src = '/headshotFallback.png';
	}
</script>

<img on:error={handleError} class="object-scale-down h-full" {src} {alt} />
