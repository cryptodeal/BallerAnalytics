import { setRandomSeed } from 'bun:jsc';
import { it, expect, describe } from 'bun:test';
import { rndFloat } from '../../src/utils/rndFloat';

describe('rndFloat zig native code', () => {
	it('time to gen 1 million random float64 using zig', () => {
		const t0 = performance.now();
		for (let i = 0; i < 1000000; i++) {
			it('random float64 `f64` generated in rndFloat.zig', () => {
				const f64 = rndFloat();
				expect(typeof f64).toBe('number');
				expect(f64 > 0).toBe(true);
				expect(f64 < 1).toBe(true);
			});
		}
		const t1 = performance.now();
		console.log(
			`rndFloat.zig took ${(t1 - t0) / 1000} seconds to generate 1 million random float64`
		);
	});
});

setRandomSeed(180);
describe('seeded Math.random', () => {
	it('time to gen 1 million random float64 using native js', () => {
		const t2 = performance.now();
		for (let i = 0; i < 1000000; i++) {
			it('random float64 `f64` generated in rndFloat.zig', () => {
				const f64 = Math.random();
				expect(typeof f64).toBe('number');
				expect(f64 > 0).toBe(true);
				expect(f64 < 1).toBe(true);
			});
		}
		const t3 = performance.now();
		console.log(
			`seeded Math.random() took ${(t3 - t2) / 1000} seconds to generate 1 million random float64`
		);
	});
});
