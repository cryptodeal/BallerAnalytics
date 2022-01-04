import { League, Team2, Player2 } from '../../../index';
import type { Player2Document, Team2Document } from '../../../index';
import { BballRefSeason } from '../../../api/bballRef/seasons';
import mongoose from 'mongoose';

interface Season {
	year: number;
	displaySeason: string;
	games: {
		preseason: mongoose.Types.ObjectId[];
		regularSeason: mongoose.Types.ObjectId[];
		postSeason: mongoose.Types.ObjectId[];
	};
	teams: mongoose.Types.ObjectId[];
	champion?: mongoose.Types.ObjectId;
	awards: {
		mvp: mongoose.Types.ObjectId[];
		roty: mongoose.Types.ObjectId[];
		dpoy?: mongoose.Types.ObjectId;
		mostImproved?: mongoose.Types.ObjectId;
		sixthMan?: mongoose.Types.ObjectId;
	};
	leaders: {
		points: {
			leader?: mongoose.Types.ObjectId;
			value?: number;
		};
		assists: {
			leader?: mongoose.Types.ObjectId;
			value?: number;
		};
		rebounds: {
			leader?: mongoose.Types.ObjectId;
			value?: number;
		};
		winShare: {
			leader?: mongoose.Types.ObjectId;
			value?: number;
		};
	};
}

export const addOrUpdateSeasons = async (name: string, seasons: BballRefSeason[]) => {
	const league = await League.findOne({ name });
	if (league) {
		for (let i = 0; i < seasons.length; i++) {
			const year = parseInt(seasons[i].displaySeason.split('-')[0]) + 1;
			const {
				displaySeason,
				mvp,
				roty,
				champion,
				pointsLeader,
				assistLeader,
				reboundLeader,
				winShareLeader
			} = seasons[i];
			const seasonIndex = league.seasons.findIndex((s) => s.year === year);
			if (seasonIndex !== -1) {
				league.seasons[seasonIndex].displaySeason = displaySeason;

				/** set champion in doc */
				if (champion !== undefined) {
					const champDoc = await Team2.findByName(champion);
					if (champDoc) league.seasons[seasonIndex].champion = champDoc._id;
				}

				/** set mvp(s) */
				for (let j = 0; j < mvp.length; j++) {
					const mvpDoc = await Player2.findByPlayerUrl(mvp[j].url);
					if (mvpDoc) league.seasons[seasonIndex].awards.mvp.addToSet(mvpDoc._id);
				}

				/** set roty(s) */
				for (let k = 0; k < roty.length; k++) {
					const rotyDoc = await Player2.findByPlayerUrl(roty[k].url);
					if (rotyDoc) league.seasons[seasonIndex].awards.roty.addToSet(rotyDoc._id);
				}

				/** set points Leader */
				if (pointsLeader) {
					const pointsLeaderDoc = await Player2.findByPlayerUrl(pointsLeader.url);
					if (pointsLeaderDoc) {
						league.seasons[seasonIndex].leaders.points.leader = pointsLeaderDoc._id;
						league.seasons[seasonIndex].leaders.points.value = pointsLeader.value;
					}
				}

				/** set rebound Leader */
				if (reboundLeader) {
					const reboundLeaderDoc = await Player2.findByPlayerUrl(reboundLeader.url);
					if (reboundLeaderDoc) {
						league.seasons[seasonIndex].leaders.rebounds.leader = reboundLeaderDoc._id;
						league.seasons[seasonIndex].leaders.rebounds.value = reboundLeader.value;
					}
				}

				/** set assists Leader */
				if (assistLeader) {
					const assistLeaderDoc = await Player2.findByPlayerUrl(assistLeader.url);
					if (assistLeaderDoc) {
						league.seasons[seasonIndex].leaders.assists.leader = assistLeaderDoc._id;
						league.seasons[seasonIndex].leaders.assists.value = assistLeader.value;
					}
				}

				/** set winShare Leader */
				if (winShareLeader) {
					const winShareLeaderDoc = await Player2.findByPlayerUrl(winShareLeader.url);
					if (winShareLeaderDoc) {
						league.seasons[seasonIndex].leaders.winShare.leader = winShareLeaderDoc._id;
						league.seasons[seasonIndex].leaders.winShare.value = winShareLeader.value;
					}
				}
			} else {
				/** TODO: add season to league */
				const season: Season = {
					year,
					displaySeason,
					games: {
						preseason: [],
						regularSeason: [],
						postSeason: []
					},
					teams: [],
					champion: undefined,
					awards: {
						mvp: [],
						roty: []
					},
					leaders: {
						points: {
							leader: undefined,
							value: undefined
						},
						assists: {
							leader: undefined,
							value: undefined
						},
						rebounds: {
							leader: undefined,
							value: undefined
						},
						winShare: {
							leader: undefined,
							value: undefined
						}
					}
				};

				if (champion !== undefined) {
					const champDoc: Team2Document = await Team2.findByName(champion);
					if (champDoc) season.champion = champDoc._id;
				}

				/** set mvp(s) */
				for (let j = 0; j < mvp.length; j++) {
					const mvpDoc: Player2Document = await Player2.findByPlayerUrl(mvp[j].url);
					if (mvpDoc) season.awards.mvp.push(mvpDoc._id);
				}

				/** set roty(s) */
				for (let k = 0; k < roty.length; k++) {
					const rotyDoc: Player2Document = await Player2.findByPlayerUrl(roty[k].url);
					if (rotyDoc) season.awards.roty.push(rotyDoc._id);
				}

				/** set points Leader */
				if (pointsLeader) {
					const pointsLeaderDoc: Player2Document = await Player2.findByPlayerUrl(pointsLeader.url);
					if (pointsLeaderDoc) {
						season.leaders.points.leader = pointsLeaderDoc._id;
						season.leaders.points.value = pointsLeader.value;
					}
				}

				/** set rebound Leader */
				if (reboundLeader) {
					const reboundLeaderDoc: Player2Document = await Player2.findByPlayerUrl(
						reboundLeader.url
					);
					if (reboundLeaderDoc) {
						season.leaders.rebounds.leader = reboundLeaderDoc._id;
						season.leaders.rebounds.value = reboundLeader.value;
					}
				}

				/** set assists Leader */
				if (assistLeader) {
					const assistLeaderDoc: Player2Document = await Player2.findByPlayerUrl(assistLeader.url);
					if (assistLeaderDoc) {
						season.leaders.assists.leader = assistLeaderDoc._id;
						season.leaders.assists.value = assistLeader.value;
					}
				}

				/** set winShare Leader */
				if (winShareLeader) {
					const winShareLeaderDoc: Player2Document = await Player2.findByPlayerUrl(
						winShareLeader.url
					);
					if (winShareLeaderDoc) {
						season.leaders.winShare.leader = winShareLeaderDoc._id;
						season.leaders.winShare.value = winShareLeader.value;
					}
				}
				league.seasons.addToSet(season);
			}
		}
		return league.save().then((league) => {
			return league;
		});
	} else {
		throw new Error('League not found');
	}
};
