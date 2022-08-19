export type HuberLossFn = <
	T extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>,
	O extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>
>(
	labels:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	predictions:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	weights?:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| import('@tensorflow/tfjs-core/dist/tensor').Tensor<
				import('@tensorflow/tfjs-core/dist/types').Rank
		  >,
	delta?: number,
	reduction?: import('@tensorflow/tfjs-core/dist/base').Reduction
) => O;

export type LogLossFn = <
	T extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>,
	O extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>
>(
	labels:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	predictions:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	weights?:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| import('@tensorflow/tfjs-core/dist/tensor').Tensor<
				import('@tensorflow/tfjs-core/dist/types').Rank
		  >,
	epsilon?: number,
	reduction?: import('@tensorflow/tfjs-core/dist/base').Reduction
) => O;

export type MeanSquaredErrorFn = <
	T extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>,
	O extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>
>(
	labels:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	predictions:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	weights?:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| import('@tensorflow/tfjs-core/dist/tensor').Tensor<
				import('@tensorflow/tfjs-core/dist/types').Rank
		  >,
	reduction?: import('@tensorflow/tfjs-core/dist/base').Reduction
) => O;

export type SigmoidCrossEntropyFn = <
	T extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>,
	O extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>
>(
	multiClassLabels:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	logits:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	weights?:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| import('@tensorflow/tfjs-core/dist/tensor').Tensor<
				import('@tensorflow/tfjs-core/dist/types').Rank
		  >,
	labelSmoothing?: number,
	reduction?: import('@tensorflow/tfjs-core/dist/base').Reduction
) => O;
export type SoftmaxCrossEntropyFn = <
	T extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>,
	O extends import('@tensorflow/tfjs-core/dist/tensor').Tensor<
		import('@tensorflow/tfjs-core/dist/types').Rank
	>
>(
	onehotLabels:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	logits:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| T,
	weights?:
		| string
		| number
		| boolean
		| Float32Array
		| Int32Array
		| Uint8Array
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<
				number | number[] | Float32Array | Int32Array | Uint8Array
		  >
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<boolean>
		| import('@tensorflow/tfjs-core/dist/types').RecursiveArray<string>
		| Uint8Array[]
		| import('@tensorflow/tfjs-core/dist/tensor').Tensor<
				import('@tensorflow/tfjs-core/dist/types').Rank
		  >,
	labelSmoothing?: number,
	reduction?: import('@tensorflow/tfjs-core/dist/base').Reduction
) => O;

export type RLLossFn =
	| HuberLossFn
	| LogLossFn
	| MeanSquaredErrorFn
	| SigmoidCrossEntropyFn
	| SoftmaxCrossEntropyFn;
