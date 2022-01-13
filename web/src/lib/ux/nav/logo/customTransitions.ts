import { cubicOut } from 'svelte/easing';

interface CustomTransitionParam {
	delay: number;
	duration: number;
	easing: (t: number) => number;
}

interface CustomTransitionResult {
	delay: number;
	duration: number;
	easing: (t: number) => number;
	css: (t: number) => string;
}
export function expand(
	node: SVGPathElement,
	params: CustomTransitionParam
): CustomTransitionResult {
	const { delay = 0, duration = 400, easing = cubicOut } = params;

	const w = parseFloat(getComputedStyle(node).strokeWidth);

	return {
		delay,
		duration,
		easing,
		css: (t) => `opacity: ${t}; stroke-width: ${t * w}`
	};
}
