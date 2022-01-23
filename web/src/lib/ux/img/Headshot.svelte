<script lang="ts">
	import LazySrcset from '$lib/ux/img/LazySrcset.svelte';
	import { collator, getImgSize } from '$lib/functions/helpers';
	export let alt: string;
	export let avif: string[];
	export let png: string[];
	export let webp: string[];
	const imgSizes: number[] = [];
	const maxSizes: string[] = [];
	const placeholder = '/headshotFallback.png';
	export let ratio = '73.0769230769%';
	let sizes: string;
	let srcsetAvif: string;
	let srcsetPng: string;
	let srcsetWebP: string;

	function updateImgData() {
		png.sort(collator.compare);
		avif.sort(collator.compare);
		webp.sort(collator.compare);
		imgSizes.splice(0);
		maxSizes.splice(0);
		png.map((p) => imgSizes.push(getImgSize(p)));
		for (let i = 0; i < imgSizes.length - 1; i++) {
			maxSizes.push(`${(imgSizes[i] + imgSizes[i + 1]) / 2}px`);
		}
		srcsetAvif = avif
			.map((a) => 'https://dttbvdi5lj1g6.cloudfront.net/' + a + ` ${getImgSize(a)}w`)
			.join(', ');
		srcsetPng = png
			.map((p) => 'https://dttbvdi5lj1g6.cloudfront.net/' + p + ` ${getImgSize(p)}w`)
			.join(', ');
		srcsetWebP = webp
			.map((w) => 'https://dttbvdi5lj1g6.cloudfront.net/' + w + ` ${getImgSize(w)}w`)
			.join(', ');
		maxSizes.sort(collator.compare);
		for (let j = 0; j < imgSizes.length; j++) {
			if (maxSizes[j]) {
				if (j === 0) {
					sizes = `(max-width: ${maxSizes[j]}) `;
				} else {
					sizes += ` (max-width: ${maxSizes[j]}) `;
				}
			}
			if (j === imgSizes.length - 1) {
				sizes += ` ${imgSizes[j]}px`;
			} else {
				sizes += `${imgSizes[j]}px,`;
			}
		}
	}
	$: if (png.length > 0 || avif.length > 0 || webp.length > 0) updateImgData();
</script>

{#if png.length > 0 || avif.length > 0 || webp.length > 0}
	<LazySrcset
		{srcsetWebP}
		{srcsetAvif}
		{srcsetPng}
		src="https://dttbvdi5lj1g6.cloudfront.net/{webp[2]}"
		{sizes}
		{placeholder}
		{alt}
		{ratio}
	/>
{:else}
	<LazySrcset
		srcsetWebP=""
		srcsetAvif=""
		srcsetPng=""
		src="headshotFallback.png"
		sizes=""
		{placeholder}
		alt="missing player headshot"
		{ratio}
	/>
{/if}
