import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { ReplayMemory as ReplayMem } from '../src/DQN/utils/ReplayMemory';

const ReplayMemTest = suite('ReplayMemoryTest');
const maxLength = 5;
const mem = new ReplayMem(maxLength);

ReplayMemTest('expect init mem.length = 0', () => {
	assert.is(mem.length, 0);
});

ReplayMemTest('append values to mem; expect mem.length = 5', () => {
	mem.append(10);
	mem.append(20);
	mem.append(30);
	mem.append(40);
	mem.append(50);
	assert.is(mem.length, maxLength);
});

ReplayMemTest('various batch sampling assertions', () => {
	for (let i = 0; i < 10; i++) {
		const batch = mem.sample(4);
		const uniqueItems = [];
		assert.is(batch.length, 4);
		batch.forEach((x) => {
			assert.is([10, 20, 30, 40, 50].indexOf(x) >= 0, true);
			if (uniqueItems.indexOf(x) === -1) {
				uniqueItems.push(x);
			}
		});
		assert.is(uniqueItems.length, batch.length);
	}
});

// ReplayMemTest.run();
