import { Game } from '$lib/_db/models';

const getTeamSchedule = (id, seasonYear) => {
	return (
		Game.find({
			$or: [{ 'home.id': id }, { 'visitor.id': id }],
			'season_meta.standings_season_year': `${seasonYear}`
			//"date": new RegExp(`^${seasonYear}|^${seasonYear+1}`)
		})
			/*.and([
    {
      $or: [
        {"date": new RegExp(`^${seasonYear}$`)},
        {"date": new RegExp(`^${seasonYear+1}$`)}
      ]
  }
  ])*/
			.select('home visitor date time season_meta preseason')
			.populate('home.id visitor.id', 'infoCommon')
			.sort('date')
			//.collation({locale: "en_US", numericOrdering: true})
			.exec()
			.then((games) => {
				return games.sort((a, b) => parseInt(a.date) - parseInt(b.date));
			})
			.catch((err) => {
				console.trace(err);
			})
	);
};

export { getTeamSchedule };
