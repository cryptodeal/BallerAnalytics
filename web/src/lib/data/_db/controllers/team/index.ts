import { Team2, IsPopulated } from '@balleranalytics/nba-api-ts';
import type { Team2Document } from '@balleranalytics/nba-api-ts';

export const getAllTeamsCommonInfo = (): Promise<Team2Document[]> => {
	return Team2.find({ seasons: { $elemMatch: { season: 2022 } } }).exec();
};

export const getTeamBySlug = async (slug: string): Promise<void | Team2Document> => {
	const team = await Team2.findOne({ 'infoCommon.slug': slug }, 'infoCommon seasons');
	if (team === null) throw Error('Error: could not find team with slug match');
	team.seasons.sort((a, b) => a.season - b.season);

	const i = team.seasons.length - 1;
	await team.populate([
		{
			path: `seasons.${i}.roster.players.player`,
			select: 'birthdate height weight name school seasons'
		},
		{
			path: `seasons.${i}.roster.coaches.coach`,
			select: 'name'
		},
		{
			path: `seasons.${i}.preseason.games`,
			select: 'home visitor date time season_meta',
			populate: {
				path: 'home.team visitor.team',
				select: 'infoCommon'
			}
		},
		{
			path: `seasons.${i}.regularSeason.games`,
			select: 'home visitor date time season_meta',
			populate: {
				path: 'home.team visitor.team',
				select: 'infoCommon'
			}
		},
		{
			path: `seasons.${i}.postseason.games`,
			select: 'home visitor date time season_meta',
			populate: {
				path: 'home.team visitor.team',
				select: 'infoCommon'
			}
		}
	]);

	team.seasons[i].roster.players.map((player) => {
		if (player?.player && IsPopulated(player.player)) {
			if (player.player.seasons) player.player.seasons.sort((a, b) => a.year - b.year);
		}
	});

	return team;
};
