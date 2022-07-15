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
		writeFile(
			`${__dirname}/../algorithm/${filename}`,
			JSON.stringify(to_serialise),
			function (err) {
				if (err) reject(err);
				resolve(null);
			}
		);
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
