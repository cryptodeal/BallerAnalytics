import { array, type NDArray } from 'vectorious';

abstract class Activator {
	public abstract activation(input: number, auxParams?: NDArray): number;

	public apply(input: number, auxParams: NDArray): number {
		return this.activation(input, auxParams);
	}
}

abstract class ModularActivator {
	public abstract activation(input: NDArray, auxParams?: NDArray): NDArray;

	public apply(input: NDArray, auxParams: NDArray): NDArray {
		return this.activation(input, auxParams);
	}
}

/**
 * SIGMOID ACTIVATION FUNCTIONS
 */

/* plain sigmoid */
export class PlainSigmoid extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 1 / (1 + Math.exp(-input));
	}
}

/* reduced sigmoid */
export class ReducedSigmoid extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 1 / (1 + Math.exp(-0.5 * input));
	}
}

/* steepened sigmoid */
export class SteepenedSigmoid extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 1.0 / (1.0 + Math.exp(-4.924273 * input));
	}
}

/**
 * bipolar sigmoid activation function:
 *  - xrange->[-1,1]
 *  - yrange->[-1,1]
 */
export class BipolarSigmoid extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 2.0 / (1.0 + Math.exp(-4.924273 * input)) - 1.0;
	}
}

/**
 * approximation sigmoid with squashing
 * range: [-4.0; 4.0]
 */
export class ApproximationSigmoid extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
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
	public activation(input: number, auxParams?: NDArray): number {
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
	public activation(input: number, auxParams?: NDArray): number {
		return 0.5 + (input / (1.0 + Math.abs(input))) * 0.5;
	}
}

/* left/right shifted sigmoid */
export class LeftShiftedSigmoid extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 1.0 / (1.0 + Math.exp(-input - 2.4621365));
	}
}

export class LeftShiftedSteepenedSigmoid extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 1.0 / (1.0 + Math.exp(-input - 2.4621365));
	}
}

export class RightShiftedSteepenedSigmoid extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 1.0 / (1.0 + Math.exp(-(4.924273 * input - 2.4621365)));
	}
}

/**
 * OTHER ACTIVATION FUNCTIONS
 */

/* hyperbolic tangent */
export class HyperbolicTangent extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return Math.tanh(0.9 * input);
	}
}

/**
 * bipolar Gaussian activation function:
 *  - xrange->[-1,1]
 *  - yrange->[-1,1]
 */
export class BipolarGaussian extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 2.0 * Math.exp(-Math.pow(input * 2.5, 2.0)) - 1.0;
	}
}

/* absolute linear */
export class AbsoluteLinear extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return Math.abs(input);
	}
}

/**
 * linear activation function with clipping; by `clipping`, we mean
 * the output value is linear between x = -1 and x = 1.
 * Below -1 and above +1, the output is clipped at -1 and +1.
 */
export class ClippedLinear extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
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
	public activation(input: number, auxParams?: NDArray): number {
		return input;
	}
}

/* null activator */
export class NullFunctor extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return 0.0;
	}
}

/* sign activator */
export class SignFunction extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		if (isNaN(input) || input == 0.0) {
			return 0.0;
		}
		if (input >= 0) {
			return -1.0;
		}
		return 1.0;
	}
}

/* sine periodic activation w doubled period */
export class SineFunction extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		return Math.sin(2.0 * input);
	}
}

/* step function x < 0 ? 0.0 : 1.0 */
export class StepFunction extends Activator {
	public activation(input: number, auxParams?: NDArray): number {
		if (input >= 0) {
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
	public activation(input: NDArray, auxParams?: NDArray): NDArray {
		let ret = 1.0;
		const inputCount = input.length;
		for (let i = 0; i < inputCount; i++) {
			ret *= input[i];
		}
		return array([ret]);
	}
}

/* finds & returns max value among inputs  */
export class MaxModule extends ModularActivator {
	public activation(input: NDArray, auxParams?: NDArray): NDArray {
		let max = Number.MIN_SAFE_INTEGER;
		const inputCount = input.length;
		for (let i = 0; i < inputCount; i++) {
			max *= max >= input[i] ? max : input[i];
		}
		return array([max]);
	}
}

/* finds & returns min value among inputs  */
export class MinModule extends ModularActivator {
	public activation(input: NDArray, auxParams?: NDArray): NDArray {
		let min = Number.MAX_SAFE_INTEGER;
		const inputCount = input.length;
		for (let i = 0; i < inputCount; i++) {
			min *= min <= input[i] ? min : input[i];
		}
		return array([min]);
	}
}
