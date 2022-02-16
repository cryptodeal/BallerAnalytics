export { SVG } from '@svgdotjs/svg.js';
export { random } from '@georgedoescode/generative-utils';
import tinycolor from 'tinycolor2';
export { tinycolor };
export { interpolateLab } from 'd3-interpolate';

import Circle from '../patterns/Circle.svelte';
import OppositeCircles from '../patterns/OppositeCircles.svelte';
import Dots from '../patterns/Dots.svelte';
import Cross from '../patterns/Cross.svelte';
import QuarterCircle from '../patterns/QuarterCircle.svelte';
import DiagonalSquare from '../patterns/DiagonalSquare.svelte';
import LetterBlock from '../patterns/LetterBlock.svelte';
import HalfSquare from '../patterns/HalfSquare.svelte';

export const shapes = [
	Circle,
	OppositeCircles,
	Dots,
	Cross,
	QuarterCircle,
	DiagonalSquare,
	LetterBlock,
	HalfSquare
];

export const bigShapes = [
	Circle,
	OppositeCircles,
	Cross,
	QuarterCircle,
	DiagonalSquare,
	LetterBlock,
	HalfSquare
];
