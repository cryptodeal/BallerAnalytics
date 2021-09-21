import { Team } from '$lib/_db/models';

const getAllTeamsCommonInfo = () => {
	//return Team.find({'meta.isComplete': {'$ne': true}}).exec()
	return Team.find({}).select('infoCommon').sort({ 'infoCommon.city': 1 }).exec();
};

const getTeamBySlug = (slug) => {
	return Team.findOne({ 'infoCommon.slug': slug })
		.exec()
		.then((team) => {
			return team.populate(`seasons.${team.seasons.length - 1}.roster.players.player`);
		})
		.catch((err) => {
			console.trace(err);
		});
};

export { getAllTeamsCommonInfo, getTeamBySlug };
