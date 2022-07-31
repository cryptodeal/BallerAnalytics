<script lang="ts">
	import { onMount } from 'svelte';

	let direction = 'left', // right, top, bottom
		alternate = false,
		behavior = 'auto', // always
		animate = false,
		pausing = true,
		duration = 30, // sec
		loop = true, // false || float
		delay = 0, // sec
		parentSize: number,
		size = 0,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		self: any;

	$: reverse = direction === 'right' || direction === 'bottom';
	$: horizontal = direction === 'left' || direction === 'right';
	$: vertical = !horizontal;
	$: measure = horizontal ? 'clientWidth' : 'clientHeight';
	$: iterations = typeof loop === 'number' ? loop : loop ? 'infinite' : 1;
	$: dir = reverse
		? alternate
			? 'alternate-reverse'
			: 'reverse'
		: alternate
		? 'alternate'
		: 'normal';
	$: ext = behavior === 'always' && parentSize > size ? Math.ceil(parentSize / size) : 0;
	$: rags = ext + (animate && loop && !alternate ? 1 : 0);

	function sizing() {
		(!rags || !size) && (size = self[measure]);
		parentSize = self.parentNode[measure];
		animate = behavior === 'always' || size > parentSize;
	}

	onMount(sizing);

	export { direction, duration, delay, loop, pausing, alternate, behavior };
</script>

<svelte:window on:resize={sizing} />

<div
	bind:this={self}
	class:animate
	class:horizontal
	class:vertical
	class:pausing
	style="
		animation-duration: {duration}s;
		animation-delay: {delay}s;
		animation-iteration-count: {iterations};
		animation-direction: {dir};
	"
>
	{#each Array(1 + rags) as _}
		<slot>Ticker default content</slot>
	{/each}
</div>

<style lang="postcss">
	div {
		transform: translate3d(0, 0, 0);
		will-change: transform;
	}
	div.horizontal {
		display: inline-block;
		white-space: nowrap;
	}
	div.vertical {
		display: block;
		white-space: normal;
	}
	div.horizontal > :global(*) {
		display: inline-block !important;
	}
	div.vertical > :global(*) {
		display: block !important;
	}
	div.animate {
		animation-timing-function: linear;
	}
	div.pausing:hover {
		animation-play-state: paused;
	}
	div.animate.horizontal {
		animation-name: horizontal;
	}
	div.animate.vertical {
		animation-name: vertical;
	}

	@keyframes horizontal {
		0% {
			transform: translate3d(0%, 0, 0);
		}
		100% {
			transform: translate3d(-50%, 0, 0);
		}
	}
	@keyframes vertical {
		0% {
			transform: translate3d(0, 0%, 0);
		}
		100% {
			transform: translate3d(0, -50%, 0);
		}
	}
</style>
