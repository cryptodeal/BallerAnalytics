import { MasterAgent } from './Master';

const master = new MasterAgent();
(async () => {
	await master.init();
	await master.train();
})();
