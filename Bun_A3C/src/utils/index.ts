import { rndFloat } from './rndFloat';
import { writeFile, readFile } from 'fs';
/**
 * We want to serialise :
 *  - the websites
 * - the episode
 * - current step
 * - current website
 * - algo parameters
 * - crawler parameters
 * -the Q values
 */
export const serialize = (to_serialise: object, filename = 'program_state.json') => {
	return new Promise((resolve, reject) => {
		writeFile(`${import.meta.dir}/../algorithm/${filename}`, JSON.stringify(to_serialise), ((
			err
		) => {
			if (err) throw Error(err);
			resolve(null);
		}) as VoidFunction);
	});
};

export const deserialize = async (path: string) => {
	return new Promise((resolve, reject) => {
		readFile(path, 'utf-8', (err, data) => {
			if (err) reject(err);
			const state_json = JSON.parse(data);
			resolve(state_json);
		});
	});
};

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
