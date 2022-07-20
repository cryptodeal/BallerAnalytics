import { rndFloat } from './rndFloat';

export const weightedRandomItem = (
	data: number[],
	prob: Uint8Array | Float32Array | Int32Array | Array<number>
) => {
	/*
    if(data.length !== prob.length) {
      throw new Error('Data and probability arrays are not of same length');
    }
  */
	const rand = rndFloat();
	let threshold = 0;
	const length = prob.length;
	for (let i = 0; i < length; i++) {
		threshold += prob[i];
		if (threshold > rand) {
			return data[i];
		}
	}
};
