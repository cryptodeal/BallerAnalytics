import { RosterML } from '../../utils/RosterML';

(async () => {
	const roster = new RosterML();
	await roster.loadData();
	await roster.trainModel();
})();
