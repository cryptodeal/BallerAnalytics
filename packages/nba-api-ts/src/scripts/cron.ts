import { CronJob } from 'cron';
import { importGamesLastWeek } from '../db/controllers/Game2';
import { importCurrentRosters } from '../db/controllers/Team2';

class DataImportScripts {
	cronJob: CronJob;
	constructor(year: number) {
		this.cronJob = new CronJob('30 * * * *', async () => {
			try {
				await this.importWeekGames();
				await this.updateCurrentRosters(year);
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

	private async updateCurrentRosters(year: number) {
		await importCurrentRosters(year);
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CronJobs = new DataImportScripts(2022);
