export type NonNegativeInteger<T extends number> = number extends T
	? never
	: `${T}` extends `-${string}` | `${string}.${string}`
	? never
	: T;

export function assertPositiveInt(x: number, name?: string) {
	if (!Number.isInteger(x)) {
		throw new Error(`Expected ${name} to be an integer, but received ${x}`);
	}
	if (!(x > 0)) {
		throw new Error(`Expected ${name} to be a positive number, but received ${x}`);
	}
}

export const getRandomInt = (min: number, max: number): number =>
	Math.floor((max - min) * Math.random()) + min;

export function getRandomInts(min: number, max: number, numIntegers: number): number[] {
	const output: number[] = [];
	for (let i = 0; i < numIntegers; i++) {
		output.push(Math.floor((max - min) * Math.random()) + min);
	}
	return output;
}

export const minMaxScale = (inputs: number[], minZero = false) => {
	let min = minZero ? 0 : Infinity;
	let max = -Infinity;
	const count = inputs.length;
	for (let i = 0; i < count; i++) {
		min = Math.min(inputs[i], min);
		max = Math.max(inputs[i], max);
	}
	max -= min;

	const scaled: number[] = new Array(count);
	for (let i = 0; i < count; i++) {
		scaled[i] = (inputs[i] - min) / max;
	}
	return scaled;
};
