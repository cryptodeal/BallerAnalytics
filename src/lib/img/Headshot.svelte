<script>
	export let src;
	export let alt;
	function handleError() {
		console.log('error'); // This never happen even when src is invalid
		src = '/headshotFallback.png';
	}
</script>

<img
	on:error={handleError}
	class="rounded-lg h-130px w-95px mx-auto w-md:(h-260px w-190px) shadow-lg antialiased"
	{src}
	{alt}
/>
