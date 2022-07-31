import { createServer } from './Server';
import { execute } from './utils';

createServer();
execute(`newsh "npm run host:worker"`);
