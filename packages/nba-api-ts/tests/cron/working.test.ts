import { suite } from 'uvu';
import { registerController, execCron, startCron, stopCron } from 'cron-decorators';

const VerifyCronWorks = suite('verifyCronWorks');

VerifyCronWorks.before(() => {
	registerController([__dirname + '../../src/scripts/cron/*.js']);
	stopCron('GamesLastWeek');
});

VerifyCronWorks('test manually exec cron', async () => {
	await execCron('GamesLastWeek');
});

VerifyCronWorks('test start cron', async () => {
	await startCron('GamesLastWeek');
});

VerifyCronWorks('test stop cron', async () => {
	await stopCron('GamesLastWeek');
});

VerifyCronWorks.run();
