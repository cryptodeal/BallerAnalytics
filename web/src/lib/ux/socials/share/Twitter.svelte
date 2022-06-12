<script lang="ts">
	import Twitter from '~icons/akar-icons/twitter-fill';
	export let text: string;
	export let url: string;
	export let hashtags: string[] = [];
	export let via: string;
	export let related: string | undefined = undefined;

	$: query = [
		text && `text=${encodeURIComponent(text)}`,
		url && `url=${encodeURIComponent(url)}`,
		hashtags && `hashtags=${hashtags.join(',')}`,
		via && `via=${encodeURIComponent(via)}`,
		related && `related=${encodeURIComponent(related)}`
	]
		.filter(Boolean)
		.join('&');

	$: href = `https://twitter.com/intent/tweet?${query}`;

	function open(e) {
		e.preventDefault();

		const w = 600;
		const h = 400;
		const x = (screen.width - w) / 2;
		const y = (screen.height - h) / 2;
		const features = `width=${w},height=${h},left=${x},top=${y}`;

		window.open(href, '_blank', features);
	}
</script>

<a class="btn gap-2" target="_blank" rel="noopener noreferrer" {href} on:click={open}>
	<Twitter class="fill-current h-7 w-7" />
	Tweet
</a>
