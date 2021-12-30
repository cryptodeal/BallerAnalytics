import { importAllGames } from '../../db/controllers/Game2';
import { initConnect, endConnect } from '../../index';

initConnect()
	.then(async () => {
		await importAllGames();
	})
	.then(endConnect)
	.then(() => console.log('Completed!'));
