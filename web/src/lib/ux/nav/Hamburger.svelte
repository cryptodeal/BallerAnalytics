<script lang="ts">
	export let open = false;
</script>

<button
	class="bg-transparent cursor-pointer rounded-md border-none text-dark-700 dark:text-light-200 hover:text-dark-900 hover:dark:text-gray-300 focus:outline-none"
	class:open
	aria-label="Toggle Navbar Dropdown"
	on:click={() => (open = !open)}
>
	<svg width="24" height="18">
		<line id="top" x1="0" y1="1.5" x2="24" y2="1.5" />
		<line id="middle" x1="0" y1="9" x2="18" y2="9" />
		<line id="bottom" x1="0" y1="16.5" x2="24" y2="16.5" />
	</svg>
</button>

<style lang="postcss">
	svg {
		min-height: 18px;
		transition: transform 0.3s ease-in-out;
	}

	svg line {
		stroke: currentColor;
		stroke-width: 3;
		transition: transform 0.3s ease-in-out;
	}

	button {
		z-index: 20;
	}

	.open svg {
		transform: scale(0.7);
	}

	.open #top {
		transform: translate(4.5px, 0px) rotate(45deg);
	}

	.open #middle {
		opacity: 0;
	}

	.open #bottom {
		transform: translate(-9px, 6.75px) rotate(-45deg);
	}
</style>
