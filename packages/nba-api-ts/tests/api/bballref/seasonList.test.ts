import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getSeasons } from '../../../src/api/bballRef/seasons';
import type { BballRefSeason } from '../../../src/api/bballRef/seasons';

const SeasonListTest = suite('seasonListTest');
let seasonData: BballRefSeason[];

SeasonListTest('get list of seasons', () => {
	assert.type(getSeasons, 'function');
});

SeasonListTest('get season data', async () => {
	seasonData = await getSeasons();
});

SeasonListTest('test seasonData exists', () => {
	assert.ok(seasonData);
});

SeasonListTest.run();
