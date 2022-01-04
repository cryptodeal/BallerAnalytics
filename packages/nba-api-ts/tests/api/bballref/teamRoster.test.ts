import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getTeamRoster } from '../../../src/api/bballRef/teams';
import type { BBRefTeamRosterItem } from '../../../src/api/bballRef/types';

const TeamRosterTest = suite('teamRosterTest');
let rosterData: BBRefTeamRosterItem[];

TeamRosterTest('getTeamRoster: expect function', () => {
	assert.type(getTeamRoster, 'function');
});

TeamRosterTest('fetch team roster data', async () => {
	rosterData = await getTeamRoster('GSW', 2022);
});

TeamRosterTest('team roster data exists', () => {
	console.log(rosterData);
	assert.ok(rosterData);
});

TeamRosterTest.run();
