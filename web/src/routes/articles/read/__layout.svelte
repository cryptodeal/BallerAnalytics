<svelte:head>
	<meta property="og:type" content="article" />
</svelte:head>
<div
	class="mx-auto max-w-3xl py-5 px-4 sm:px-6 sm:py-12 lg:max-w-4xl lg:py-16 lg:px-8 xl:max-w-6xl"
>
	<article class="flex-grow glassmorphicBg mx-1 rounded-md sm:(mx-auto p-10) p-2 prose lg:prose-xl">
		<slot />
	</article>
	<div class="flex py-5 twitter justify-center">
		<a
			class="twitter-share-button"
			href="https://twitter.com/intent/tweet?text=Check%20this%20out:%20"
			rel="noopener"
			data-size="large"
		>
			Tweet
		</a>
		<script src="https://platform.twitter.com/widgets.js"></script>
	</div>
</div>
