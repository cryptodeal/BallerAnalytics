import { CronJob } from 'cron';
import { importGamesLastWeek } from '../../db/controllers/Game2';

class DataImportScripts {
	cronJob: CronJob;
	constructor() {
		this.cronJob = new CronJob('30 * * * *', async () => {
			try {
				await this.importWeekGames();
			} catch (e) {
				console.error(e);
			}
		});

		// Start job
		if (!this.cronJob.running) {
			this.cronJob.start();
		}
	}

	private async importWeekGames() {
		await importGamesLastWeek();
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CronJobs = new DataImportScripts();
