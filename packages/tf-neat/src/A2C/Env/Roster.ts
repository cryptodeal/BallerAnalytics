import { fileExists } from '../../A3C_Exp/utils';
import { seededRandom } from '../../utils';
import { readFile, writeFile } from 'fs/promises';
import { RosterDataSet, RosterDatum, RosterDatumInputs } from './types';

import type { DQNPlayerLean, DQNPlayer } from '@balleranalytics/nba-api-ts';
import type { TeamOpts, DQNRoster, DQNRosterLean } from '../../DQN/tasks/types';

export class Roster {
	public done = false;
	private opts: TeamOpts;
	private data_size = 0;
	public playerPool: DQNPlayer[] = [];
	private roster: DQNRoster = {} as DQNRoster;
	private leanRosters: DQNRosterLean[] = [];
	constructor(opts: TeamOpts) {
		this.opts = opts;
		this.resetRoster();
	}

	private newData: RosterDatum[] = [];
	public storeNewData = false;

	public saveDataSet = async (isValid: boolean) => {
		const path = process.cwd() + '/data/rosterDataset.json';
		const inputs: RosterDatumInputs = <RosterDatumInputs>(
			new Array(13).fill([1, 1, 1, 1, 1, 1, 1, 1, 1])
		);
		const playerCount = this.playerPool.length;
		for (let i = 0; i < playerCount; i++) {
			inputs[i] = this.playerPool[i].getRosterEncoding();
		}
		const labels: [0 | 1] = [isValid ? 1 : 0];
		/**
		 * if this.newData.length < 10000 AND
		 * (inputs are valid AND seededRandom < 0.1) OR inputs are invalid,
		 * add roster to newData
		 */
		if (this.storeNewData) {
			if (this.newData.length < 10000) {
				if ((labels[0] === 1 && seededRandom() < 0.1) || labels[0] === 0) {
					this.newData.push({ inputs, labels });
					console.log(
						`${
							labels[0] === 1 ? 'added valid roster' : 'added invalid roster'
						} newData size: ${(this.data_size += 1)}`
					);
				}
				/* if newData.length <= 10000, attempt to store data */
			} else {
				const exists = await fileExists(path);
				/* if file exists, append new data && reset newData */
				if (exists && this.data_size <= 100000) {
					/* try parsing currentData & appending newData */
					try {
						const currentData = <RosterDataSet>JSON.parse(await readFile(path, 'utf8'));
						if (currentData.data.length <= 100000) {
							const data = [...currentData.data, ...this.newData];
							this.data_size = data.length;
							console.log(`Dataset size: ${this.data_size}`);
							await writeFile(path, JSON.stringify({ data }, null, 2));
							this.newData = [];
						} else {
							this.newData = [];
							this.storeNewData = false;
						}
						/**
						 * catch error if file exists, but has no currentData
						 * OR if currentData is too large, causing JSON.parse to
						 * fail and throw an error
						 */
					} catch (e) {
						console.log(e);
						this.data_size = this.newData.length;
						await writeFile(path, JSON.stringify({ data: this.newData }, null, 2));
						this.newData = [];
					}
					/* if `!exists`, write new data */
				} else if (!exists) {
					this.data_size = this.newData.length;
					await writeFile(path, JSON.stringify({ data: this.newData }, null, 2));
					this.newData = [];
					/* if exists && data_size > 100000, do nothing */
				} else {
					this.newData = [];
					this.storeNewData = false;
				}
			}
		}
	};

	public resetRoster(opts?: TeamOpts) {
		if (opts) this.opts = opts;

		const { pg, sg, sf, pf, c, g, f, util, be } = this.opts;
		if (!Object.values(this.opts).some((n) => n > 0)) this.done = true;
		this.roster['pg'] = new Array(pg).fill(null);
		this.roster['sg'] = new Array(sg).fill(null);
		this.roster['sf'] = new Array(sf).fill(null);
		this.roster['pf'] = new Array(pf).fill(null);
		this.roster['c'] = new Array(c).fill(null);
		this.roster['g'] = new Array(g).fill(null);
		this.roster['f'] = new Array(f).fill(null);
		this.roster['util'] = new Array(util).fill(null);
		this.roster['be'] = new Array(be).fill(null);
	}

	public reset() {
		const roster = new Roster(this.opts);
		roster.refreshDataset(this.newData, this.data_size, this.storeNewData);
		return roster;
	}
	private cloneLeanRoster(roster: DQNRosterLean) {
		return JSON.parse(JSON.stringify(roster)) as DQNRosterLean;
	}

	private testPlayerUse(roster: DQNRosterLean) {
		const playerSet: Set<string> = new Set();
		const playerMap: Map<string, number> = new Map();
		Object.values(roster).forEach((players) => {
			const playerCount = players.length;
			for (let i = 0; i < playerCount; i++) {
				const tempPlayer = players[i];
				if (typeof tempPlayer === 'string') {
					if (!playerMap.has(tempPlayer)) {
						playerMap.set(tempPlayer, 1);
					} else {
						const count = playerMap.get(tempPlayer) as number;
						playerMap.set(tempPlayer, count + 1);
					}
					playerSet.add(tempPlayer);
				}
			}
		});
		let isRepeat = false;
		playerMap.forEach((count) => {
			if (count > 1) {
				isRepeat = true;
			}
		});
		return playerSet.size == this.playerPool.length && !isRepeat;
	}

	public getBestRoster() {
		const count = this.leanRosters.length;
		let bestRoster: DQNRosterLean | undefined = undefined;
		let bestScore = 0;
		for (let i = 0; i < count; i++) {
			const score = this.getRosterValue(this.leanRosters[i]);
			if (!bestRoster || score > bestScore) {
				bestRoster = this.leanRosters[i];
				bestScore = score;
			}
		}
		return { roster: bestRoster, score: bestScore };
	}

	private getRosterValue(roster: DQNRosterLean) {
		let value = 0;
		const players: string[] = [];
		Object.values(roster).map((position) =>
			(position.filter((p) => typeof p === 'string') as string[]).map((p) => players.push(p))
		);
		const count = players.length;
		for (let i = 0; i < count; i++) {
			value += this.playerPool.findIndex((p) => p.isIdMatch(players[i]));
		}
		return value;
	}

	private addRosterVariant(playerId: string, position: string, roster?: DQNRosterLean) {
		if (!roster) {
			const roster: DQNRosterLean = {};
			(roster['pg'] = new Array(this.opts.pg).fill(null)),
				(roster['sg'] = new Array(this.opts.sg).fill(null)),
				(roster['sf'] = new Array(this.opts.sf).fill(null)),
				(roster['pf'] = new Array(this.opts.pf).fill(null)),
				(roster['c'] = new Array(this.opts.c).fill(null)),
				(roster['g'] = new Array(this.opts.g).fill(null)),
				(roster['f'] = new Array(this.opts.f).fill(null)),
				(roster['be'] = new Array(this.opts.be).fill(null)),
				(roster['util'] = new Array(this.opts.util).fill(null));

			roster[position][0] = playerId;
			return roster;
		}

		const newRoster = this.cloneLeanRoster(roster);
		newRoster[position][newRoster[position].indexOf(null)] = playerId;
		return newRoster;
	}

	private isBenchReady(roster: DQNRosterLean): boolean {
		return (
			!roster['pg'].includes(null) &&
			!roster['sg'].includes(null) &&
			!roster['sf'].includes(null) &&
			!roster['pf'].includes(null) &&
			!roster['c'].includes(null) &&
			!roster['g'].includes(null) &&
			!roster['f'].includes(null) &&
			!roster['util'].includes(null)
		);
	}

	public refreshDataset(data: RosterDatum[], size: number, storeNewData: boolean) {
		this.newData = data;
		this.data_size = size;
		this.storeNewData = storeNewData;
	}

	private testPick(player: DQNPlayer) {
		const rosterVariants: DQNRosterLean[] = [];
		const leanPlayer: DQNPlayerLean = player.lean();
		const { _id } = leanPlayer;
		if (!this.leanRosters.length) {
			/* add roster variant w player as util */
			if (leanPlayer.util) rosterVariants.push(this.addRosterVariant(_id, 'util'));

			/* if player is pg, add roster variant w player as pg */
			if (leanPlayer.pg) rosterVariants.push(this.addRosterVariant(_id, 'pg'));

			/* if player is sg, add roster variant w player as sg */
			if (leanPlayer.sg) rosterVariants.push(this.addRosterVariant(_id, 'sg'));

			/* if player is sf, add roster variant w player as sf */
			if (leanPlayer.sf) rosterVariants.push(this.addRosterVariant(_id, 'sf'));

			/* if player is pf, add roster variant w player as pf */
			if (leanPlayer.pf) rosterVariants.push(this.addRosterVariant(_id, 'pf'));

			/* if player is c, add roster variant w player as c */
			if (leanPlayer.c) rosterVariants.push(this.addRosterVariant(_id, 'c'));

			/* if player is g, add roster variant w player as g */
			if (leanPlayer.g) rosterVariants.push(this.addRosterVariant(_id, 'g'));

			/* if player is f, add roster variant w player as f */
			if (leanPlayer.f) rosterVariants.push(this.addRosterVariant(_id, 'f'));
		} else {
			const rosterCount = this.leanRosters.length;
			for (let i = 0; i < rosterCount; i++) {
				/* boolean specifying if all non-bench roster slots full */
				const isBenchReady = this.isBenchReady(this.leanRosters[i]);

				/* add roster variant w player as util */
				if (!isBenchReady && this.leanRosters[i]['util'].includes(null))
					rosterVariants.push(this.addRosterVariant(_id, 'util', this.leanRosters[i]));

				/* if player is pg, add roster variant w player as pg */
				if (!isBenchReady && leanPlayer.pg && this.leanRosters[i]['pg'].includes(null))
					rosterVariants.push(this.addRosterVariant(_id, 'pg', this.leanRosters[i]));

				/* if player is sg, add roster variant w player as sg */
				if (!isBenchReady && leanPlayer.sg && this.leanRosters[i]['sg'].includes(null))
					rosterVariants.push(this.addRosterVariant(_id, 'sg', this.leanRosters[i]));

				/* if player is sf, add roster variant w player as sf */
				if (!isBenchReady && leanPlayer.sf && this.leanRosters[i]['sf'].includes(null))
					rosterVariants.push(this.addRosterVariant(_id, 'sf', this.leanRosters[i]));

				/* if player is pf, add roster variant w player as pf */
				if (!isBenchReady && leanPlayer.pf && this.leanRosters[i]['pf'].includes(null))
					rosterVariants.push(this.addRosterVariant(_id, 'pf', this.leanRosters[i]));

				/* if player is c, add roster variant w player as c */
				if (!isBenchReady && leanPlayer.c && this.leanRosters[i]['c'].includes(null))
					rosterVariants.push(this.addRosterVariant(_id, 'c', this.leanRosters[i]));

				/* if player is g, add roster variant w player as g */
				if (!isBenchReady && leanPlayer.g && this.leanRosters[i]['g'].includes(null))
					rosterVariants.push(this.addRosterVariant(_id, 'g', this.leanRosters[i]));

				/* if player is f, add roster variant w player as f */
				if (!isBenchReady && leanPlayer.f && this.leanRosters[i]['f'].includes(null))
					rosterVariants.push(this.addRosterVariant(_id, 'f', this.leanRosters[i]));

				/* only add roster variant w player on bench after all other slots are filled */
				if (isBenchReady)
					rosterVariants.push(this.addRosterVariant(_id, 'be', this.leanRosters[i]));
			}
		}
		return rosterVariants;
	}

	public addPick(player: DQNPlayer) {
		if (this.done) throw new Error(`Cannot addPick to invalid roster`);
		/* add pick to team player pool */
		this.playerPool.push(player);
		const rosters = this.testPick(player);
		this.leanRosters.splice(0);
		this.leanRosters = rosters;
		if (!this.leanRosters.length) this.done = true;
		return this.saveDataSet(this.done ? false : true);
	}

	public getRoster() {
		return {
			pg: this.roster.pg,
			sg: this.roster.sg,
			sf: this.roster.sf,
			pf: this.roster.pf,
			c: this.roster.c,
			g: this.roster.g,
			f: this.roster.f,
			util: this.roster.util,
			be: this.roster.be
		};
	}

	public getOppRoster() {
		return this.leanRosters[0];
	}
}
