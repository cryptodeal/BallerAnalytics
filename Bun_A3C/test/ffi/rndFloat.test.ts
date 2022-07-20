import { it, expect, describe } from 'bun:test';
import { rndFloat } from '../../src/utils/rndFloat';

describe('rndFloat zig native code', () => {
	for (let i = 0; i < 10000; i++) {
		it('random float64 `f64` generated in rndFloat.zig', () => {
			const f64 = rndFloat();
			expect(typeof f64).toBe('number');
			expect(f64 > 0).toBe(true);
			expect(f64 < 1).toBe(true);
		});
	}
});
