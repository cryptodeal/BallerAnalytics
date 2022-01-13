import { CronJob } from 'cron';
import { importGamesLastWeek } from '../db/controllers/Game2';
import { importCurrentRosters } from '../db/controllers/Team2';

class DataImportScripts {
	cronJob: CronJob;
	constructor() {
		this.cronJob = new CronJob('30 * * * *', async () => {
			try {
				await this.importWeekGames();
				await this.updateCurrentRosters();
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

	private async updateCurrentRosters() {
		await importCurrentRosters(2022);
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CronJobs = new DataImportScripts();
