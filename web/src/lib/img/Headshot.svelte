<script>
	export let src;
	export let alt;
	function handleError() {
		console.log('error'); // This never happen even when src is invalid
		src = '/headshotFallback.png';
	}
</script>

<img on:error={handleError} class="w-56px" {src} {alt} />
