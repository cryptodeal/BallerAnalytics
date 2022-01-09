import { importLatestGames } from '../../db/controllers/Game2';
import { initConnect, endConnect } from '../../index';

initConnect()
	.then(async () => {
		await importLatestGames();
	})
	.then(endConnect)
	.then(() => console.log('Completed!'));
