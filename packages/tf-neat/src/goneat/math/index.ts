import { type NDArray, array } from 'vectorious';
import {
	BipolarSigmoid,
	SteepenedSigmoid,
	PlainSigmoid,
	ReducedSigmoid,
	ApproximationSigmoid,
	ApproximationSteepenedSigmoid,
	InverseAbsoluteSigmoid,
	LeftShiftedSigmoid,
	LeftShiftedSteepenedSigmoid,
	RightShiftedSteepenedSigmoid,
	HyperbolicTangent,
	BipolarGaussian,
	Linear,
	AbsoluteLinear,
	ClippedLinear,
	NullFunctor,
	SignFunction,
	SineFunction,
	StepFunction,
	MultiplyModule,
	MinModule,
	MaxModule
} from './activations';
import type { ActivationFunction, ModularActivationFunction } from './types';

export enum ActivationType {
	PlainSigmoidActivation,
	SigmoidReducedActivation,
	SigmoidSteepenedActivation,
	SigmoidBipolarActivation,
	SigmoidApproximationActivation,
	SigmoidSteepenedApproximationActivation,
	SigmoidInverseAbsoluteActivation,
	SigmoidLeftShiftedActivation,
	LeftShiftedSteepenedSigmoid,
	SigmoidRightShiftedSteepenedActivation,
	TanhActivation,
	GaussianBipolarActivation,
	LinearActivation,
	LinearAbsActivation,
	LinearClippedActivation,
	NullActivation,
	SignActivation,
	SineActivation,
	StepActivation,
	MultiplyModuleActivation,
	MaxModuleActivation,
	MinModuleActivation
}

export type ActvByTypeOpts = {
	aType: ActivationType | number;
	auxParams?: NDArray;
};

export type NodeActvByType = ActvByTypeOpts & {
	input: number;
};

export type ModActvByType = ActvByTypeOpts & {
	inputs: NDArray;
};

const plainSigmoid = new PlainSigmoid().apply,
	reducedSigmoid = new ReducedSigmoid().apply,
	steepenedSigmoid = new SteepenedSigmoid().apply,
	bipolarSigmoid = new BipolarSigmoid().apply,
	approximateSigmoid = new ApproximationSigmoid().apply,
	approximationSteepenedSigmoid = new ApproximationSteepenedSigmoid().apply,
	inverseAbsoluteSigmoid = new InverseAbsoluteSigmoid().apply,
	leftShiftedSigmoid = new LeftShiftedSigmoid().apply,
	leftShiftedSteepenedSigmoid = new LeftShiftedSteepenedSigmoid().apply,
	rightShiftedSteepenedSigmoid = new RightShiftedSteepenedSigmoid().apply,
	hyperbolicTangent = new HyperbolicTangent().apply,
	bipolarGaussian = new BipolarGaussian().apply,
	linear = new Linear().apply,
	absoluteLinear = new AbsoluteLinear().apply,
	clippedLinear = new ClippedLinear().apply,
	nullFunctor = new NullFunctor().apply,
	signFunction = new SignFunction().apply,
	sineFunction = new SineFunction().apply,
	stepFunction = new StepFunction().apply,
	multiplyModule = new MultiplyModule().apply,
	maxModule = new MaxModule().apply,
	minModule = new MinModule().apply;

/* node activator factor; init w default activation functions */
export class NodeActivationFactory {
	public activators: Map<ActivationType | number, ActivationFunction> = new Map();
	public moduleActivators: Map<ActivationType | number, ModularActivationFunction> = new Map();
	public forward: Map<ActivationType | number, string> = new Map();
	public inverse: Map<string, ActivationType | number> = new Map();

	constructor() {
		/* register default node activators */
		this.register(ActivationType.PlainSigmoidActivation, plainSigmoid, 'SigmoidPlainActivation');
		this.register(
			ActivationType.SigmoidReducedActivation,
			reducedSigmoid,
			'SigmoidReducedActivation'
		);
		this.register(
			ActivationType.SigmoidSteepenedActivation,
			steepenedSigmoid,
			'SigmoidSteepenedActivation'
		);
		this.register(
			ActivationType.SigmoidBipolarActivation,
			bipolarSigmoid,
			'SigmoidBipolarActivation'
		);
		this.register(
			ActivationType.SigmoidApproximationActivation,
			approximateSigmoid,
			'SigmoidApproximationActivation'
		);
		this.register(
			ActivationType.SigmoidSteepenedApproximationActivation,
			approximationSteepenedSigmoid,
			'SigmoidSteepenedApproximationActivation'
		);
		this.register(
			ActivationType.SigmoidInverseAbsoluteActivation,
			inverseAbsoluteSigmoid,
			'SigmoidInverseAbsoluteActivation'
		);
		this.register(
			ActivationType.SigmoidLeftShiftedActivation,
			leftShiftedSigmoid,
			'SigmoidLeftShiftedActivation'
		);
		this.register(
			ActivationType.LeftShiftedSteepenedSigmoid,
			leftShiftedSteepenedSigmoid,
			'LeftShiftedSteepenedSigmoid'
		);
		this.register(
			ActivationType.SigmoidRightShiftedSteepenedActivation,
			rightShiftedSteepenedSigmoid,
			'SigmoidRightShiftedSteepenedActivation'
		);

		this.register(ActivationType.TanhActivation, hyperbolicTangent, 'TanhActivation');
		this.register(
			ActivationType.GaussianBipolarActivation,
			bipolarGaussian,
			'GaussianBipolarActivation'
		);
		this.register(ActivationType.LinearActivation, linear, 'LinearActivation');
		this.register(ActivationType.LinearAbsActivation, absoluteLinear, 'LinearAbsActivation');
		this.register(ActivationType.LinearClippedActivation, clippedLinear, 'LinearClippedActivation');
		this.register(ActivationType.NullActivation, nullFunctor, 'NullActivation');
		this.register(ActivationType.SignActivation, signFunction, 'SignActivation');
		this.register(ActivationType.SineActivation, sineFunction, 'SineActivation');
		this.register(ActivationType.StepActivation, stepFunction, 'StepActivation');

		/* register neuron modules activators */
		this.registerModule(
			ActivationType.MultiplyModuleActivation,
			multiplyModule,
			'MultiplyModuleActivation'
		);
		this.registerModule(ActivationType.MaxModuleActivation, maxModule, 'MaxModuleActivation');
		this.registerModule(ActivationType.MinModuleActivation, maxModule, 'MinModuleActivation');
	}

	/**
	 * registers given neuron activation function w
	 * provided type and name into factory
	 */
	public register(aType: ActivationType | number, aFunc: ActivationFunction, fName: string) {
		/* store function */
		this.activators.set(aType, aFunc);

		/* store name<-->type bidirectional mapping */
		this.forward.set(aType, fName);
		this.inverse.set(fName, aType);
	}

	/**
	 * registers given neuron module activation function
	 * w provided type and name into factory
	 */
	public registerModule(
		aType: ActivationType | number,
		aFunc: ModularActivationFunction,
		fName: string
	) {
		/* store function */
		this.moduleActivators.set(aType, aFunc);

		/* store name<-->type bidirectional mapping */
		this.forward.set(aType, fName);
		this.inverse.set(fName, aType);
	}

	/**
	 * used to calculate activation value for given
	 * input and auxParams using activation fn w
	 * specified Type; prints error and returns -0.0
	 * if request unsupported activation type.
	 */
	public activateByType(opts: NodeActvByType) {
		const { aType, input } = opts;
		let { auxParams } = opts;
		if (!auxParams) auxParams = array();
		const fn = this.activators.get(aType);
		if (!fn) throw new Error(`unknown neuron activation type: ${aType}`);
		return fn(input, auxParams);
	}

	/**
	 * applies corresponding module activation fn to
	 * the input values and return resulting output values;
	 * panics if request unsupported activation type
	 */
	public activateModuleByType(opts: ModActvByType) {
		const { aType, inputs } = opts;
		let { auxParams } = opts;
		if (!auxParams) auxParams = array();
		const fn = this.moduleActivators.get(aType);
		if (!fn) throw new Error(`unknown module activation type: ${aType}`);
		return fn(inputs, auxParams);
	}

	/**
	 * parse node activation type name & return
	 * corresponding activationType
	 */
	public activationTypeFromName(name: string) {
		const t = this.inverse.get(name);
		if (!t) throw new Error(`unsupported activation type name: ${name}`);
		return t;
	}

	/* returns activation function name from given type */
	public activationNameFromType(aType: ActivationType | number) {
		const name = this.forward.get(aType);
		if (!name) throw new Error(`unsupported activation type: ${aType}`);
		return name;
	}
}

export const NodeActivators = new NodeActivationFactory();
