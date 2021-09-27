import { Team } from '$lib/_db/models';

const getAllTeamsCommonInfo = () => {
	//return Team.find({'meta.isComplete': {'$ne': true}}).exec()
	return Team.find({}).select('infoCommon').sort({ 'infoCommon.city': 1 }).exec();
};

const getTeamBySlug = (slug) => {
	return Team.findOne({ 'infoCommon.slug': slug }, 'infoCommon seasons')
		.exec()
		.then((team) => {
			team.seasons.sort((a, b) => a.season - b.season);
			return team.populate([
				{
					path: `seasons.${team.seasons.length - 1}.roster.players.player`,
					select: 'birthdate height weight name school'
				},
				{
					path: `seasons.${team.seasons.length - 1}.roster.coaches.coach`,
					select: 'name'
				},
				{
					path: `seasons.${team.seasons.length - 1}.games.preseason`,
					select: 'home visitor date time season_meta',
					populate: {
						path: 'home.id visitor.id',
						select: 'infoCommon'
					}
				},
				{
					path: `seasons.${team.seasons.length - 1}.games.regularSeason`,
					select: 'home visitor date time season_meta',
					populate: {
						path: 'home.id visitor.id',
						select: 'infoCommon'
					}
				},
				{
					path: `seasons.${team.seasons.length - 1}.games.postseason`,
					select: 'home visitor date time season_meta',
					populate: {
						path: 'home.id visitor.id',
						select: 'infoCommon'
					}
				}
			]);
		})
		.catch((err) => {
			console.trace(err);
		});
};

const getTeamIdFromSlug = (slug) => {
	return Team.findOne({ 'infoCommon.slug': slug }, '_id')
		.exec()
		.catch((err) => {
			console.trace(err);
		});
};

const getTeamRoster = (slug, seasonYear) => {
	let seasonIndex;
	return Team.findOne({ 'infoCommon.slug': slug }, 'seasons')
		.select('seasons')
		.exec()
		.then((team) => {
			for (let i = 0; i < team.seasons.length; i++) {
				if (team.seasons[i].season == seasonYear) seasonIndex = i;
			}
			return team.populate([
				{
					path: `seasons.${seasonIndex}.roster.players.player`,
					select: 'birthdate height weight name school'
				},
				{
					path: `seasons.${seasonIndex}.roster.coaches.coach`,
					select: 'name'
				},
				{
					path: `seasons.${seasonIndex}.games.preseason`,
					select: 'home visitor date time season_meta',
					populate: {
						path: 'home.id visitor.id',
						select: 'infoCommon'
					}
				},
				{
					path: `seasons.${seasonIndex}.games.regularSeason`,
					select: 'home visitor date time season_meta',
					populate: {
						path: 'home.id visitor.id',
						select: 'infoCommon'
					}
				},
				{
					path: `seasons.${seasonIndex}.games.postseason`,
					select: 'home visitor date time season_meta',
					populate: {
						path: 'home.id visitor.id',
						select: 'infoCommon'
					}
				}
			]);
		})
		.then((team) => {
			return team.seasons[seasonIndex];
		})
		.catch((err) => {
			console.trace(err);
		});
};

export { getAllTeamsCommonInfo, getTeamBySlug, getTeamRoster, getTeamIdFromSlug };
