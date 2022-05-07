import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getRandomInt, getRandomInts } from '../src/DQN/utils';

const UtilsTest = suite('UtilsTest');

UtilsTest('getRandomInt(); max > min', () => {
	const values = [];
	for (let i = 0; i < 10; i++) {
		const v = getRandomInt(3, 6);
		assert.is(v >= 3, true);
		assert.is(v < 6, true);
		if (values.indexOf(v) === -1) {
			values.push(v);
		}
	}
	assert.is(values.length > 1, true);
});

UtilsTest('getRandomIntegers(); max > min', () => {
	const values = getRandomInts(3, 6, 10);
	assert.is(values.length, 10);
	values.forEach((v) => {
		assert.is(v >= 3, true);
		assert.is(v < 6, true);
	});
});

UtilsTest.run();
