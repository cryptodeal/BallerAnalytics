import sdv from 'sportsdataverse';
import type {
	IEspnSchedule,
	IEspnBoxscore,
	ParsedEspnBoxscore,
	ParsedEspnBoxscoreTeam,
	ParsedEspnBoxscoreTeamPlayer,
	IEspnTeamPlayers,
	EspnGameIdAndStatus
} from './types';
import type { PopulatedDocument, Game2Document } from '../../index';

export const getScheduleEspn = (
	year: number,
	month: number,
	day: number
): Promise<IEspnSchedule> => {
	return sdv.nba.getSchedule(year, month, day);
};

export const findEspnGameId = (
	dateStr: string,
	espnSchedule: IEspnSchedule,
	game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>
): [string, boolean] | undefined => {
	const data = espnSchedule[dateStr];
	if (!data) throw Error(`No ESPN scoreboard data for ${dateStr}`);
	/* if key "dateStr" is defined, destructure array of games from data */
	const { games } = data;
	for (let i = 0; i < games.length; i++) {
		const [gameData] = games[i].competitions;
		const homeIdx = gameData.competitors.findIndex((c) => c.homeAway == 'home');
		const visitorIdx = gameData.competitors.findIndex((c) => c.homeAway == 'away');
		console.log(`gameData.competitors[homeIdx].team.id:`, gameData.competitors[homeIdx].team.id);
		console.log(`game.home.team.meta.helpers.espnTeamId:`, game.home.team.meta.helpers.espnTeamId);
		console.log(
			`gameData.competitors[visitorIdx].team.id:`,
			gameData.competitors[visitorIdx].team.id
		);
		console.log(
			`game.visitor.team.meta.helpers.espnTeamId:`,
			game.visitor.team.meta.helpers.espnTeamId
		);
		if (
			gameData.competitors[homeIdx].team.id == game.home.team.meta.helpers.espnTeamId &&
			gameData.competitors[visitorIdx].team.id == game.visitor.team.meta.helpers.espnTeamId
		) {
			return [games[i].id, games[i].status.type.completed];
		}
	}
};

export const getEspnBoxscore = (gameId: number): Promise<ParsedEspnBoxscore> => {
	return sdv.nba.getBoxScore(gameId).then((data: IEspnBoxscore) => {
		const parsedBoxscore: ParsedEspnBoxscore = {};
		for (const team of data.teams) {
			const stats = team.statistics;
			if (stats.length > 0) {
				const [
					fg,
					fgPct,
					threePtFg,
					threePtFgPct,
					ft,
					ftPct,
					totReb,
					offReb,
					defReb,
					ast,
					stl,
					blk,
					to,
					tTo,
					totalTo,
					techFouls,
					totalTechFouls,
					flagrantFouls,
					ptsOffTo,
					fBPs,
					pIP,
					pf,
					ll
				] = stats;

				const fgSplit = fg.displayValue.split('-');
				const threePtFgSplit = threePtFg.displayValue.split('-');
				const ftSplit = ft.displayValue.split('-');
				const teamData: ParsedEspnBoxscoreTeam = {
					fieldGoalsMade: parseInt(fgSplit[0]),
					fieldGoalsAttempted: parseInt(fgSplit[1]),
					fieldGoalsPct: parseFloat(fgPct.displayValue) / 100,
					threePointersMade: parseInt(threePtFgSplit[0]),
					threePointersAttempted: parseInt(threePtFgSplit[1]),
					threePointersPct: parseFloat(threePtFgPct.displayValue) / 100,
					freeThrowsMade: parseInt(ftSplit[0]),
					freeThrowsAttempted: parseInt(ftSplit[1]),
					freeThrowsPct: parseFloat(ftPct.displayValue) / 100,
					totalReb: parseInt(totReb.displayValue),
					offReb: parseInt(offReb.displayValue),
					defReb: parseInt(defReb.displayValue),
					assists: parseInt(ast.displayValue),
					steals: parseInt(stl.displayValue),
					blocks: parseInt(blk.displayValue),
					turnovers: {
						tov: parseInt(to.displayValue),
						team: parseInt(tTo.displayValue),
						total: parseInt(totalTo.displayValue)
					},
					fouls: {
						technical: parseInt(techFouls.displayValue),
						totalTechnical: parseInt(totalTechFouls.displayValue),
						flagrant: parseInt(flagrantFouls.displayValue),
						fouls: parseInt(pf.displayValue)
					},
					turnoverPoints: parseInt(ptsOffTo.displayValue),
					fastBreakPoints: parseInt(fBPs.displayValue),
					pointsInPaint: parseInt(pIP.displayValue),
					largestLead: parseInt(ll.displayValue),
					players: []
				};
				parsedBoxscore[team.team.id] = teamData;
			}
		}
		/* add players to team */
		console.log(data.players);
		if (data.players && data.players.length > 0) {
			for (const player of data.players) {
				const teamId = player.team.id;
				for (let i = 0; i < player.statistics[0].athletes.length; i++) {
					const athleteStats = player.statistics[0].athletes[i].stats;
					const playerData: ParsedEspnBoxscoreTeamPlayer = {
						name: {
							displayName: player.statistics[0].athletes[i].athlete.displayName,
							shortName: player.statistics[0].athletes[i].athlete.shortName
						},
						reason: player.statistics[0].athletes[i].reason,
						starter: player.statistics[0].athletes[i].starter,
						espnId: player.statistics[0].athletes[i].athlete.id,
						jersey: player.statistics[0].athletes[i].athlete.jersey,
						position: {
							displayName: player.statistics[0].athletes[i].athlete.position.displayName,
							name: player.statistics[0].athletes[i].athlete.position.name,
							abbreviation: player.statistics[0].athletes[i].athlete.position.abbreviation
						},
						ejected: player.statistics[0].athletes[i].ejected,
						didNotPlay: player.statistics[0].athletes[i].didNotPlay,
						active: player.statistics[0].athletes[i].active
					};
					if (athleteStats.length > 0) {
						const [
							min,
							fg,
							threePtFg,
							ft,
							offReb,
							defReb,
							totReb,
							assists,
							steals,
							blocks,
							tov,
							pf,
							plusMinus,
							pts
						] = athleteStats;
						const fgSplit = fg.split('-');
						const threePtFgSplit = threePtFg.split('-');
						const ftSplit = ft.split('-');
						playerData.stats = {
							minutes: parseInt(min),
							fieldGoalsMade: parseInt(fgSplit[0]),
							fieldGoalsAttempted: parseInt(fgSplit[1]),
							threePointersMade: parseInt(threePtFgSplit[0]),
							threePointersAttempted: parseInt(threePtFgSplit[1]),
							freeThrowsMade: parseInt(ftSplit[0]),
							freeThrowsAttempted: parseInt(ftSplit[1]),
							offReb: parseInt(offReb),
							defReb: parseInt(defReb),
							totalReb: parseInt(totReb),
							assists: parseInt(assists),
							steals: parseInt(steals),
							blocks: parseInt(blocks),
							turnovers: parseInt(tov),
							personalFouls: parseInt(pf),
							plusMinus: parseInt(plusMinus),
							points: parseInt(pts)
						};
					}
					parsedBoxscore[teamId]?.players.push(playerData);
				}
			}
		}
		return parsedBoxscore;
	});
};

export const getEspnTeamPlayers = (teamId: string): Promise<IEspnTeamPlayers> => {
	return sdv.nba.getTeamPlayers(teamId);
};