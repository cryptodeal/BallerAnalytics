import * as tf from '@tensorflow/tfjs-node';
const a = tf.tensor1d([0, 0.625, 0.495, 0.165, 1.262, 0.507, 0.318, 0.39]);
const iters = 1000;
for (let i = 0; i < 1000; ++i) {
	const b = a.add(a).dataSync();
}
const t0 = performance.now();
for (let i = 0; i < iters; ++i) {
	const b = a.add(a).dataSync();
}
const t1 = performance.now();
console.log((1e6 * (t1 - t0)) / iters, 'ns/iter');
