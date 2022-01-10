import { CronController, Cron } from 'cron-decorators';
import { importGamesLastWeek } from '../../db/controllers/Game2';
import { atMinute, combine, everyHour } from 'node-cron-expression';
const gameWeekCronStr = combine(everyHour(), atMinute(30)).toString();

// Cron jobs will be mounted under the namespace "jobs".
@CronController('jobs')
export class JobController {
	// Async cron job that runs every second.
	@Cron('GamesLastWeek', gameWeekCronStr)
	public async secCronJob(): Promise<void> {
		await importGamesLastWeek();
	}

	// Cron job that runs at the 22nd December 2019 at 15:42:00.
	/*
    @Cron('date', new Date('December 22, 2019 15:42:00'))
    public dateCronJob(): void {
      console.log("I am cron Job 'date' and I just ran!");
    }
  */

	public momentCronJob(): void {
		console.log("I am cron Job 'moment' and I just ran!");
	}
}
