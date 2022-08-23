import { LeanRoster, RosterDatumInputs } from '../../src/A2C/Env';
import { RosterML } from '../../src/utils/RosterML';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getRandomInt } from '../../src/DQN/utils';
import { RosterEncd } from '@balleranalytics/nba-api-ts';
import { sleep } from '../../src/utils';

const LeanRosterTest = suite('LeanRosterTest');
let roster: LeanRoster, encdPerms: RosterEncd[];

LeanRosterTest.before(async () => {
	const model = await LeanRoster.loadModel();
	roster = new LeanRoster(model);
});

LeanRosterTest('generate posEncd permutations; verify type', () => {
	encdPerms = RosterML.getAllEncodings();
	const encdCount = encdPerms.length;
	for (let i = 0; i < encdCount; i++) {
		const encd = encdPerms[i];
		assert.is(Array.isArray(encd), true);
		assert.is(encd.length, 9);
	}
});

LeanRosterTest('draft 13 players, validating @ each step; repeat x 10k', async () => {
	let validCnt = 0,
		failedCnt = 0;
	/**
	 * given all position encodings and random selection
	 * of encodings (w repitition), it's unlikely to generate
	 * an invalid roster; so we run 10,000 times and log output
	 */
	for (let i = 0; i < 10000; i++) {
		let count = 0;
		while (count < 13) {
			const pick = getRandomInt(0, encdPerms.length);
			const { value, isValid } = roster.addPick(encdPerms[pick]);
			assert.is(value <= 1, true);
			assert.is(value >= 0, true);

			assert.is(typeof isValid, 'boolean');
			isValid ? validCnt++ : failedCnt++;
			count++;
			/* DEBUG OUTPUT: */
			console.log(`ROUND: ${i + 1}; PICK: ${count};\n'isValid': ${isValid}, 'value': ${value}`);
		}
		roster.reset();
	}
	console.log(`validCnt: ${validCnt}; failedCnt: ${failedCnt}`);
	await sleep(5000);
});

const countOccurrences = (arr: number[], val: number) =>
	arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

LeanRosterTest('draft 13 players, validating @ each step; repeat x 10k', async () => {
	const harderEncd = encdPerms.filter((encd) => countOccurrences(encd, 1) < 5);

	let validCnt = 0,
		failedCnt = 0;
	/**
	 * here, we filter the position encodings to only those
	 * w fewer than 5 instances of `1` (i.e. oneHot `true` value)
	 * this increases likelihood of generating an invalid roster
	 * `harderEncd.length === 28`
	 */
	for (let i = 0; i < 10000; i++) {
		let count = 0;
		while (count < 13) {
			const pick = getRandomInt(0, harderEncd.length);
			const { value, isValid } = roster.addPick(harderEncd[pick]);
			assert.is(value <= 1, true);
			assert.is(value >= 0, true);
			assert.is(typeof isValid, 'boolean');
			isValid ? validCnt++ : failedCnt++;
			count++;
			/* DEBUG OUTPUT:
      console.log(
				`ROUND: ${i + 1}; PICK: ${count};\n'isValid': ${isValid}, 'value': ${value}`
			);
      console.log(roster.getRosterInputs())
      */
		}
		roster.reset();
	}
	console.log(`validCnt: ${validCnt}; failedCnt: ${failedCnt}`);
	await sleep(5000);
});

LeanRosterTest.after(() => {
	roster.disposeModel();
});

LeanRosterTest.run();
