import { registerController } from 'cron-decorators';
import path from 'path';
const __dirname = path.resolve();
registerController([__dirname + '/cron/*.ts']);
