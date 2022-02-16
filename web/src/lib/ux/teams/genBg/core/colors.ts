import Color from 'color';
import { tinycolor, random } from './utils';

export function getBackgroundColors(colorPalette: string[]): { bgInner: string; bgOuter: string } {
	const bg = tinycolor.mix(colorPalette[0], colorPalette[1], 50).desaturate(10).toString();

	// Make Lighter version
	const bgInner: string = tinycolor(bg).lighten(10).toString();
	// And darker version
	const bgOuter: string = tinycolor(bg).darken(10).toString();
	return { bgInner, bgOuter };
}

const genPaletteColor = (a: number[], b: number[], fac: number): string => {
	const ret = [];

	for (let i = 0; i < Math.min(a.length, b.length); i++) {
		ret[i] = a[i] * (1 - fac) + b[i] * fac;
	}

	return Color.rgb(ret[0], ret[1], ret[2]).hex();
};

export const genPalette = (begin: Color, end: Color, n: number): string[] => {
	const ret: string[] = [];

	for (let i = 0; i < n; i++) {
		const fac = i / (n - 1);
		ret.push(genPaletteColor(begin.rgb().array(), end.rgb().array(), fac));
	}

	return ret;
};

export const getTwoColors = (colors: string[]): { foreground: string; background: string } => {
	const colorList = [...colors];

	// Get random index for this array of colors
	const colorIndex = random(0, colorList.length - 1, true);
	// Set the background to the color at that array
	const background = colorList[colorIndex];
	// Remove that color from the options
	colorList.splice(colorIndex, 1);
	// Set the foreground to any other color in the array
	const foreground = random(colorList);

	return { foreground, background };
};
