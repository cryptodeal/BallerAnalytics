import { initConnect, endConnect } from '../../index';
import { importTeamRosters } from '../../db/controllers/Team2';

initConnect()
	.then(async () => {
		await importTeamRosters();
	})
	.then(endConnect)
	.then(() => console.log('Completed!'));
