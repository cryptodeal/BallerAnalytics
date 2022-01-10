import { registerController } from 'cron-decorators';

registerController([__dirname + '/cron/*.ts']);
