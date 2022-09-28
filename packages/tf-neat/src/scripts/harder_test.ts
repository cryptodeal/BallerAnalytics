import * as tf from '@tensorflow/tfjs-node';
console.log(tf.env());
console.log(tf.getBackend());
//const a = tf.tensor1d([0, 0.625, 0.495, 0.165, 1.262, 0.507, 0.318, 0.39]);
const a = tf.randomNormal([1024 * 1024]);
const iters = 1000;
{
	let b = a;
	for (let i = 0; i < 1000; ++i) {
		b = b.add(a);
	}
	b.dataSync();
}
const t0 = performance.now();
let b = a;
for (let i = 0; i < iters; ++i) {
	b = b.add(a);
}
const o = b.dataSync()[1];
const t1 = performance.now();
console.log(o, (1e6 * (t1 - t0)) / iters, 'ns/iter');
