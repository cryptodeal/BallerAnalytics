import { Team } from '$lib/_db/models';

const getAllTeamsCommonInfo = () => {
	//return Team.find({'meta.isComplete': {'$ne': true}}).exec()
	return Team.find({}).select('infoCommon').exec();
};

const getTeamBySlug = (slug) => {
	return Team.findOne({ 'infoCommon.slug': slug }).exec();
};

export { getAllTeamsCommonInfo, getTeamBySlug };
