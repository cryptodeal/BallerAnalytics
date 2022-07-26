import { MasterAgent } from './Master';

const master = new MasterAgent(1);
(async () => {
	await master.init();
	await master.train();
})();
