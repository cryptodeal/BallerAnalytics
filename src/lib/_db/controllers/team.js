import { Team } from '$lib/_db/models';

const getAllTeamsCommonInfo = () => {
	//return Team.find({'meta.isComplete': {'$ne': true}}).exec()
	return Team.find({}).select('infoCommon').sort({"infoCommon.city": 1}).exec();
};

const getTeamBySlug = (slug) => {
	return Team.findOne({ 'infoCommon.slug': slug }).populate('seasons.roster.players.player').exec();
};

export { getAllTeamsCommonInfo, getTeamBySlug };
