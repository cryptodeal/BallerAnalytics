import Float64Array from '@stdlib/array/float64';
import exp from '@stdlib/math/base/special/exp';
import abs from '@stdlib/math/base/special/abs';
import tanh from '@stdlib/math/base/special/tanh';
import pow from '@stdlib/math/base/special/pow';
import isNaN from '@stdlib/assert/is-nan';
import signbit from '@stdlib/number/float64/base/signbit';
import sin from '@stdlib/math/base/special/sin';
import Max from '@stdlib/math/base/special/fast/max';
import Min from '@stdlib/math/base/special/fast/min';
import FLOAT64_MIN_SAFE_INTEGER from '@stdlib/constants/float64/min-safe-integer';
import FLOAT64_MAX_SAFE_INTEGER from '@stdlib/constants/float64/max-safe-integer';

abstract class Activator {
	public abstract activation(input: number, auxParams?: Float64Array): number;

	public apply(input: number, auxParams: Float64Array): number {
		return this.activation(input, auxParams);
	}
}

abstract class ModularActivator {
	public abstract activation(input: Float64Array, auxParams?: Float64Array): Float64Array;

	public apply(input: Float64Array, auxParams: Float64Array): Float64Array {
		return this.activation(input, auxParams);
	}
}

/**
 * SIGMOID ACTIVATION FUNCTIONS
 */

/* plain sigmoid */
export class PlainSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 1 / (1 + exp(-input));
	}
}

/* reduced sigmoid */
export class ReducedSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 1 / (1 + exp(-0.5 * input));
	}
}

/* steepened sigmoid */
export class SteepenedSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 1.0 / (1.0 + exp(-4.924273 * input));
	}
}

/**
 * bipolar sigmoid activation function:
 *  - xrange->[-1,1]
 *  - yrange->[-1,1]
 */
export class BipolarSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 2.0 / (1.0 + exp(-4.924273 * input)) - 1.0;
	}
}

/**
 * approximation sigmoid with squashing
 * range: [-4.0; 4.0]
 */
export class ApproximationSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		const four = 4.0,
			one32nd = 0.03125;
		if (input < -4.0) {
			return 0.0;
		}
		if (input < 0.0) {
			return (input + four) * (input + four) * one32nd;
		}
		if (input < 4.0) {
			return 1.0 - (input - four) * (input - four) * one32nd;
		}

		return 1.0;
	}
}

/**
 * steepened approximation sigmoid with
 * squashing range: [-1.0; 1.0]
 */
export class ApproximationSteepenedSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		const one = 1.0,
			oneHalf = 0.5;
		if (input < -1.0) {
			return 0.0;
		}
		if (input < 0.0) {
			return (input + one) * (input + one) * oneHalf;
		}
		if (input < 1.0) {
			return 1.0 - (input - one) * (input - one) * oneHalf;
		}
		return 1.0;
	}
}

/* inverse absolute sigmoid */
export class InverseAbsoluteSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 0.5 + (input / (1.0 + abs(input))) * 0.5;
	}
}

/* left/right shifted sigmoid */
export class LeftShiftedSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 1.0 / (1.0 + exp(-input - 2.4621365));
	}
}

export class LeftShiftedSteepenedSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 1.0 / (1.0 + exp(-input - 2.4621365));
	}
}

export class RightShiftedSteepenedSigmoid extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 1.0 / (1.0 + exp(-(4.924273 * input - 2.4621365)));
	}
}

/**
 * OTHER ACTIVATION FUNCTIONS
 */

/* hyperbolic tangent */
export class HyperbolicTangent extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return tanh(0.9 * input);
	}
}

/**
 * bipolar Gaussian activation function:
 *  - xrange->[-1,1]
 *  - yrange->[-1,1]
 */
export class BipolarGaussian extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 2.0 * exp(-pow(input * 2.5, 2.0)) - 1.0;
	}
}

/* absolute linear */
export class AbsoluteLinear extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return abs(input);
	}
}

/**
 * linear activation function with clipping; by `clipping`, we mean
 * the output value is linear between x = -1 and x = 1.
 * Below -1 and above +1, the output is clipped at -1 and +1.
 */
export class ClippedLinear extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		if (input < -1.0) {
			return -1.0;
		}
		if (input > 1.0) {
			return 1.0;
		}
		return input;
	}
}

/* linear activation */
export class Linear extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return input;
	}
}

/* null activator */
export class NullFunctor extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return 0.0;
	}
}

/* sign activator */
export class SignFunction extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		if (isNaN(input) || input == 0.0) {
			return 0.0;
		}
		if (signbit(input)) {
			return -1.0;
		}
		return 1.0;
	}
}

/* sine periodic activation w doubled period */
export class SineFunction extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		return sin(2.0 * input);
	}
}

/* step function x < 0 ? 0.0 : 1.0 */
export class StepFunction extends Activator {
	public activation(input: number, auxParams?: Float64Array): number {
		if (signbit(input)) {
			return 0.0;
		} else {
			return 1.0;
		}
	}
}

/**
 * MODULAR ACTIVATION FUNCTIONS
 */

/* multiplies input values and returns multiplication results */
export class MultiplyModule extends ModularActivator {
	public activation(input: Float64Array, auxParams?: Float64Array): Float64Array {
		let ret = 1.0;
		const inputCount = input.length;
		for (let i = 0; i < inputCount; i++) {
			ret *= input[i];
		}
		return new Float64Array([ret]);
	}
}

/* finds & returns max value among inputs  */
export class MaxModule extends ModularActivator {
	public activation(input: Float64Array, auxParams?: Float64Array): Float64Array {
		let max = FLOAT64_MIN_SAFE_INTEGER;
		const inputCount = input.length;
		for (let i = 0; i < inputCount; i++) {
			max *= Max(max, input[i]);
		}
		return new Float64Array([max]);
	}
}

/* finds & returns min value among inputs  */
export class MinModule extends ModularActivator {
	public activation(input: Float64Array, auxParams?: Float64Array): Float64Array {
		let min = FLOAT64_MAX_SAFE_INTEGER;
		const inputCount = input.length;
		for (let i = 0; i < inputCount; i++) {
			min *= Min(min, input[i]);
		}
		return new Float64Array([min]);
	}
}
