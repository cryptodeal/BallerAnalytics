import { CronJob } from 'cron';
import { importGamesLastWeek, syncLiveEspnGameData } from '../db/controllers/Game2';
import { importCurrentRosters } from '../db/controllers/Team2';
import { serverlessConnect } from '../db/connect';
import config from '../config';

class DataImportScripts {
	cronJob: CronJob;
	nbaGamesCron: CronJob;
	constructor(year: number) {
		this.cronJob = new CronJob('30 * * * *', async () => {
			try {
				await this.connect();
				await this.importWeekGames();
				await this.updateCurrentRosters(year);
			} catch (e) {
				console.error(e);
			}
		});

		this.nbaGamesCron = new CronJob('* * * * *', async () => {
			try {
				await this.connect();
				await this.syncLiveGames();
			} catch (e) {
				console.trace(e);
			}
		});

		// Start cronJob
		if (!this.cronJob.running) {
			this.cronJob.start();
		}

		// Start nbaGamesCron
		if (!this.nbaGamesCron.running) {
			this.nbaGamesCron.start();
		}
	}

	private async connect() {
		await serverlessConnect(config.MONGO_URI);
	}

	private async importWeekGames() {
		await importGamesLastWeek();
	}

	private async updateCurrentRosters(year: number) {
		await importCurrentRosters(year);
	}

	private async syncLiveGames() {
		// if (config.VITE_NODE_ENV === 'production' || config.VITE_NODE_ENV === 'development') {
		await syncLiveEspnGameData();
		/*
    } else {
        await syncLiveGameData();
      }
  */
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CronJobs = new DataImportScripts(2022);
