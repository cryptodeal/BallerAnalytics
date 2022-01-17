import { Player2, endConnect, initConnect } from '../../index';
import { storePlayerImage } from '../../api/nba/player/images';

initConnect()
	.then(async () => {
		let count = await Player2.countDocuments({
			'meta.helpers.nbaPlayerId': { $exists: true },
			'meta.images.headshot.avif.0': { $exists: false }
		});
		for await (const player of Player2.find({
			'meta.helpers.nbaPlayerId': { $exists: true },
			'meta.images.headshot.avif.0': { $exists: false }
		})) {
			console.log(count);
			await storePlayerImage(player);
			count--;
		}
	})
	.then(endConnect)
	.then(() => console.log('Completed!'));
