import { CronJob } from 'cron';
import { importGamesLastWeek } from '../../db/controllers/Game2';
import { atMinute, combine, everyHour } from 'node-cron-expression';
const gameWeekCronStr = combine(everyHour(), atMinute(30)).toString();

class DataImportScripts {
	cronJob: CronJob;
	constructor() {
		console.log(gameWeekCronStr);
		this.cronJob = new CronJob(gameWeekCronStr, async () => {
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
