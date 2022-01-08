import { initConnect, endConnect } from '../../index';
import { Player2 } from '../../index';
import { addPlayerBasicData } from '../../db/controllers/Player2';

const importData = async () => {
	for (const player of await Player2.find({ 'meta.helpers.bballRef.playerUrl': 'walkeke02' })) {
		await addPlayerBasicData(player);
	}
};

initConnect(true).then(importData).then(endConnect);
