import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Player2, initConnect, endConnect } from '../../../src';
import config from '../../../src/config';
import { Player2Document } from '../../../src/db/interfaces/mongoose.gen';
import { storePlayerImage } from '../../../src/api/nba/images';

const PlayerImageTest = suite('playerImageTest');
let playerWPic: Player2Document;
let playerWPicRes: string[];

PlayerImageTest.before(async () => {
	await initConnect(config.VITE_NODE_ENV === 'production' ? true : false);
});

PlayerImageTest.after(async () => {
	await endConnect();
});

PlayerImageTest('find playerWPic: instance of Player2', async () => {
	/** Player2 is James Harden; Expect a headshot exists */
	playerWPic = await Player2.findOne({ 'meta.helpers.nbaPlayerId': '201935' });
	assert.instance(playerWPic, Player2);
});

PlayerImageTest('storePlayerImage: function', () => {
	assert.type(storePlayerImage, 'function');
});

PlayerImageTest('test storing player image: string[]', async () => {
	const data = await storePlayerImage(playerWPic);
	if (Array.isArray(data)) {
		playerWPicRes = data;
		assert.instance(playerWPicRes, Array);
	}
});

PlayerImageTest.run();
