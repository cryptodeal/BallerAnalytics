<script lang="ts">
	import { SVG, random } from '../core/utils';
	export let size: number,
		foreground: string,
		background: string,
		x: number,
		y: number,
		letters: string[] = [];

	const selectedCharacters = [
		'A',
		'B',
		'C',
		'D',
		'E',
		'F',
		'G',
		'H',
		'I',
		'J',
		'K',
		'L',
		'M',
		'N',
		// "O",
		'P',
		// "Q",
		'R',
		'S',
		'T',
		'U',
		'V',
		'W',
		'X',
		'Y',
		'Z'
	].filter((c) => letters.includes(c));
	const char = random(selectedCharacters);

	function mask(node: SVGGElement) {
		const mask = SVG().rect(size, size).fill('#fff').move(x, y);
		SVG(node).maskWith(mask);
	}

	function transformText(node: SVGTextElement) {
		SVG(node)
			.center(x + size / 2, y + size / 2)
			.rotate(random([0, 90, 180, 270]));
	}
</script>

<g class="letter-block" use:mask>
	<rect height={size} width={size} fill={background} {x} {y} />
	<text
		use:transformText
		font-family="Source Code Pro"
		font-size={size * 1.2}
		font-weight="800"
		text-anchor="middle"
		fill={foreground}>{char}</text
	>
</g>
