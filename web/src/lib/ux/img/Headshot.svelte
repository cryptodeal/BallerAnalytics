<script lang="ts">
	export let src: string;
	export let alt: string;
	function handleError() {
		console.log('error'); // This never happen even when src is invalid
		src = '/headshotFallback.png';
	}
</script>

<img on:error={handleError} class="w-56px" {src} {alt} />
