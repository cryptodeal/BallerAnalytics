import { Player2 } from '@balleranalytics/nba-api-ts';
export const loadSeasonPlayers = async (season) => {
    return Player2.fantasyData(season).then((players) => {
        return Promise.all(players.map((p) => {
            return p
                .populate('seasons.regularSeason.games')
                .exec()
                .then((p) => {
                return p;
            });
        }));
    });
};
