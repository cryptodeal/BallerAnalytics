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
