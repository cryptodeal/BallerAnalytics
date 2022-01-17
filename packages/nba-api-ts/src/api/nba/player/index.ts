import nba from 'nba';
import type { IStatsPlayerInfo } from '../nba';

export const getPlayerInfo = (PlayerID: string): Promise<IStatsPlayerInfo> => {
	return nba.stats.playerInfo({ PlayerID });
};
