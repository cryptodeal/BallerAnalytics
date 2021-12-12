import { endConnect, initConnect } from './db/connect';
import { importAllGames } from './db/controllers/Game2';

initConnect()
	.then(async () => {
		await importAllGames();
	})
	.then(endConnect)
	.then(() => console.log('Completed!'));
