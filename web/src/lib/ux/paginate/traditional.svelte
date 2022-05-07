<script lang="ts">
	import RightArrow from '~icons/akar-icons/arrow-right';
	import LeftArrow from '~icons/akar-icons/arrow-left';
	export let pages = 0;
	export let currentPage = 0;
</script>

<div class="w-full">
	{#if pages > 1}
		<div class="w-full">
			<div class="flex inline-flex items-center gap-4 mx-auto">
				{#if currentPage > 0}
					<LeftArrow />
				{/if}
				{currentPage} of {pages}
				{#if currentPage < pages}
					<RightArrow />
				{/if}
			</div>
		</div>
	{/if}
</div>
