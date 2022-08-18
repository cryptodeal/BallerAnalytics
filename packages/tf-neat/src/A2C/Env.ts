import { assertPositiveInt, getRandomInt } from '../DQN/utils';
import { buffer } from '@tensorflow/tfjs-node';
import { readFile, writeFile } from 'fs/promises';
import type { Tensor, Rank } from '@tensorflow/tfjs-node';
import type {
	TeamOpts,
	TaskState,
	DraftTaskParams,
	TaskStepOutput,
	DQNRoster,
	DQNRosterLean
} from '../DQN/tasks/types';
import { DQNPlayer, DQNPlayerLean } from '@balleranalytics/nba-api-ts';
import { DraftAPI } from '../DQN/utils/Draft';
import { fileExists } from '../A3C_Exp/utils';
import { seededRandom } from '../utils';

/* TODO: tune parameters */

/* TODO: Test variations of reward vals */
export const INVALID_ROSTER_REWARD = -0.75;
export const UNAVAIL_PLAYER_REWARD = -0.75;
export const FAILED_DRAFT_REWARD = -1;

type RosterEncd = [number, number, number, number, number, number, number, number, number];

enum RosterPos {
	PG,
	SG,
	SF,
	PF,
	C,
	G,
	F,
	UTIL,
	BE
}

export class LeanRoster {
	private playerPool: RosterEncd[] = [];
	public done = false;
	public rosterVariants: RosterEncd[] = [];
	private pg: number;
	private sg: number;
	private sf: number;
	private pf: number;
	private c: number;
	private f: number;
	private util: number;
	private be: number;

	private genRoster = (): RosterEncd => <RosterEncd>new Array(9).fill(0);

	private copyVariant = (variant: RosterEncd) => {
		const newVariant = this.genRoster();
		for (let i = 0; i < 9; i++) {
			newVariant[i] = variant[i];
		}
		return newVariant;
	};

	constructor(opts: TeamOpts) {
		const { pg, sg, sf, pf, c, f, util, be } = opts;
		this.pg = pg;
		this.sg = sg;
		this.sf = sf;
		this.pf = pf;
		this.c = c;
		this.f = f;
		this.util = util;
		this.be = be;
	}

	private testVariant(variant: RosterEncd, slot: number) {
		switch (slot) {
			case RosterPos.PG:
				return variant[RosterPos.PG] <= this.pg;
			case RosterPos.SG:
				return variant[RosterPos.SG] <= this.sg;
			case RosterPos.SF:
				return variant[RosterPos.SF] <= this.sf;
			case RosterPos.PF:
				return variant[RosterPos.PF] <= this.pf;
			case RosterPos.C:
				return variant[RosterPos.C] <= this.c;
			case RosterPos.G:
				return variant[RosterPos.G] <= this.f;
			case RosterPos.F:
				return variant[RosterPos.F] <= this.f;
			case RosterPos.UTIL:
				return variant[RosterPos.UTIL] <= this.util;
			default:
				return variant[RosterPos.BE] <= this.be;
		}
	}

	private totalCount = (arr: number[]): Map<number, number> =>
		arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());

	public addPick(pstnEncd: RosterEncd) {
		this.playerPool.push(pstnEncd);
		let validFound = false;
		this.playerPool.sort((a, b) => {
			const tempA = this.totalCount(a);
			const aVals = [...tempA.values()];

			const tempB = this.totalCount(b);
			const bVals = [...tempB.values()];
			if (bVals[1] > aVals[1]) return 1;
			if (bVals[1] < aVals[1]) return -1;
			return 0;
		});
		const variants: RosterEncd[] = [];
		const poolSize = this.playerPool.length;
		for (let i = 0; i < poolSize; i++) {
			for (let j = 0; j < 9; j++) {
				if (i === 0) {
					const tempRoster = this.genRoster();
					if (this.playerPool[i][j] === 1) {
						tempRoster[j] += 1;
						if (this.testVariant(tempRoster, j)) {
							variants.push(tempRoster);
							if (i === poolSize - 1) {
								validFound = true;
								break;
							}
						}
					}
				} else {
					const variantSize = variants.length;
					for (let k = 0; k < variantSize; k++) {
						if (this.playerPool[i][j] === 1) {
							const variantCopy = this.copyVariant(variants[k]);
							variantCopy[j] += 1;
							if (this.testVariant(variantCopy, j)) {
								variants.push(variantCopy);
								if (i === poolSize - 1) {
									validFound = true;
									break;
								}
							}
						}
					}
				}
			}
		}
		return validFound;
	}
}

export type RosterDatumInputs = [
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd
];

export type RosterDatum = {
	inputs: RosterDatumInputs;
	labels: [0 | 1];
};

export type RosterDataSet = {
	data: RosterDatum[];
};

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

	public saveDataSet = async (isValid: boolean) => {
		const path = process.cwd() + '/data/rosterDataset.json';
		const exists = await fileExists(path);
		const inputs: RosterDatumInputs = <RosterDatumInputs>(
			new Array(13).fill([1, 1, 1, 1, 1, 1, 1, 1, 1])
		);
		const playerCount = this.playerPool.length;
		for (let i = 0; i < playerCount; i++) {
			inputs[i] = this.playerPool[i].getRosterEncoding();
		}
		const labels: [0 | 1] = [isValid ? 1 : 0];
		if (inputs.length === 13) {
			if (
				exists &&
				this.data_size <= 100000 &&
				((labels[0] === 1 && seededRandom() < 0.25) || labels[0] === 0)
			) {
				try {
					const currentData = <RosterDataSet>JSON.parse(await readFile(path, 'utf8'));
					if (this.data_size === 0) this.data_size = currentData.data.length;
					if (currentData.data.length <= 100000 && inputs.length === 13) {
						currentData.data.push({ inputs, labels });
						this.data_size = currentData.data.length;
						console.log('Dataset Size:', this.data_size);
						this.data_size = currentData.data.length;
						return writeFile(path, JSON.stringify(currentData, null, 2));
					}
					return;
				} catch (e) {
					console.log(e);
					const data = [{ inputs, labels }];

					return writeFile(path, JSON.stringify({ data }, null, 2));
				}
			} else if (!exists) {
				const data = [{ inputs, labels }];
				return writeFile(path, JSON.stringify({ data }, null, 2));
			}
		}

		return;
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

	public reset(opts?: TeamOpts) {
		this.resetRoster(opts);
		this.playerPool = [];
		this.leanRosters = [];
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

export class DraftTask {
	public all_actions: number[];
	public num_actions: number;
	public oppCount: number;
	public teamRoster: Roster;
	/* const to track draft round and pick */
	public round = 0;
	public current_pick_number = 0;
	public drafted_player_indices: Map<number, boolean> = new Map();
	private draftApi: DraftAPI;
	private dims: [number, number, number];
	/* TODO: store all state in 1 array/buffer (i.e. manipulating state tensor) */
	private selfState: number[][] = [];
	private envState: number[][] = [];
	private teamOpts: TeamOpts;
	public pickSlot = 1;
	private pick!: DQNPlayer;

	constructor(args: DraftTaskParams) {
		const { all_actions, dimensions, teamOpts, oppCount } = args;
		this.draftApi = new DraftAPI(all_actions, oppCount, teamOpts);
		this.dims = dimensions;
		/* ensure values are non neg int */
		assertPositiveInt(all_actions.length, 'all_actions.length');
		assertPositiveInt(oppCount, 'oppCount');
		assertPositiveInt(all_actions.length, 'this.num_actions');
		Object.values(teamOpts).map((x, i) => assertPositiveInt(x, `teamOpts[${i}]`));
		this.teamOpts = teamOpts;
		this.oppCount = oppCount;
		this.all_actions = [...Array(all_actions.length).keys()];
		this.num_actions = all_actions.length;
		this.teamRoster = new Roster(this.teamOpts);

		this.reset();
	}

	get dims1() {
		return this.dims[0];
	}

	get dims2() {
		return this.dims[1];
	}

	get dims3() {
		return this.dims[2];
	}

	get draftOrder() {
		return this.draftApi.draftOrder;
	}
	/**
	 * Reset the state of the task.
	 *
	 * Returns initial state of the game.
	 * See `getState()` docs for addtl details.
	 */
	reset() {
		this.init();
		this.draftApi.reset();
		this.drafted_player_indices = new Map();
		this.teamRoster = new Roster(this.teamOpts);
		this.initEnv();
		return this.getState();
	}

	simulatePriorPicks(teamNo: number) {
		// console.log(`simulating prior picks in round`);
		const endIdx = this.draftApi.draftOrder.findIndex((x) => x === teamNo);
		/* if no picks prior, return */
		if (endIdx === 0) return;

		const priorTeams = this.draftApi.draftOrder.slice(0, endIdx);
		// console.log(this.draftApi.draftOrder);
		// console.log(priorTeams);
		const priorCount = priorTeams.length;
		for (let i = 0; i < priorCount; i++) {
			const pick = this.draftApi.simulatePick(priorTeams[i]);
			this.drafted_player_indices.set(pick, true);
			this.envState[pick] = this.draftApi.getPlayerInputs(pick);
		}
	}

	simulateLaterPicks(teamNo: number) {
		// console.log(`simulating remaining picks in round`);
		const startIdx = this.draftApi.draftOrder.findIndex((x) => x === teamNo);
		/* if no picks after, reverse order & return */
		if (startIdx === this.draftApi.draftOrder.length - 1) {
			this.draftApi.reverseDraftOrder();
			return;
		}

		const laterTeams = this.draftApi.draftOrder.slice(startIdx + 1);
		// console.log(this.draftApi.draftOrder);
		// console.log(laterTeams);

		const laterCount = laterTeams.length;
		for (let i = 0; i < laterCount; i++) {
			const pick = this.draftApi.simulatePick(laterTeams[i]);
			this.drafted_player_indices.set(pick, true);
			this.envState[pick] = this.draftApi.getPlayerInputs(pick);
		}
		this.draftApi.reverseDraftOrder();
	}

	/**
	 * Perform a step of the Task
	 *
	 * `action` The action to take in the current step.
	 *   The meaning of the possible values:
	 *     number: 0, 1, 2, etc... === idx of draftPick
	 */
	async step(action: number, forceNextState = false): Promise<TaskStepOutput> {
		let done = false,
			reward = 0;
		const validPick = this.draftPlayer(action);
		await this.teamRoster.addPick(this.pick);
		/* TODO: capture state here, but only return if not done */
		// const state = this.getState(),

		if (!validPick) {
			console.log(`invalid pick; failed`);
			done = true;
			reward += UNAVAIL_PLAYER_REWARD;
			/* Negative Saltation: https://www.hindawi.com/journals/mpe/2019/7619483/ */
			// if (this.selfState.length > 7) reward += UNAVAIL_PLAYER_REWARD / 3;
		}

		if (this.teamRoster.done) {
			console.log(`team roster failed`);
			done = true;
			reward += INVALID_ROSTER_REWARD;
			/* Negative Saltation: https://www.hindawi.com/journals/mpe/2019/7619483/ */
			// if (this.selfState.length > 7) reward += INVALID_ROSTER_REWARD / 3;
		}

		let milestone = false;
		if (done) {
			reward += FAILED_DRAFT_REWARD;
			if (forceNextState) {
				return {
					reward,
					milestone,
					state: this.getState(),
					done
				};
			}

			return { reward, done, milestone };
		}

		milestone = true;
		reward += this.draftApi.getReward(action);
		this.selfState.unshift(this.pick.inputs);

		/**
		 * TaskStepOutput
		 *   - `reward`: calc number value of reward
		 *   - `state`: new state of the game after the step.
		 *   - `milestone`: boolean indicating if DQN made pick
		 *   - `done`: boolean indicating whether task ended after step
		 */

		return {
			reward,
			milestone,
			state: this.getState(),
			done
		};
	}

	private init() {
		/* reset state of task actor */
		this.selfState = [];
	}

	private initEnv() {
		this.envState = new Array(this.num_actions);
		for (let i = 0; i < this.num_actions; i++) {
			this.envState[i] = this.draftApi.getPlayerInputs(i);
		}
	}

	private draftPlayer(action: number) {
		this.pick = this.draftApi.getPlayer(action);
		const isAvail = this.draftApi.isPlayerAvail(action);
		this.draftApi.flagDrafted(action);
		this.drafted_player_indices.set(action, true);
		this.envState[action] = this.draftApi.getPlayerInputs(action);
		return isAvail;
	}

	getState(): TaskState {
		return {
			s: this.selfState.slice(),
			e: this.envState.slice()
		};
	}
}

export const getRandomAction = (numActions: number) => {
	return getRandomInt(0, numActions);
};

export function getStateTensor(
	state: TaskState | TaskState[],
	dims1: number,
	dims2: number,
	dims3: number
): Tensor<Rank> {
	if (!Array.isArray(state)) {
		state = [state];
	}
	const numExamples = state.length;
	/* TODO: use single buffer for efficiency */
	const buff = buffer([numExamples, dims1, dims2, dims3]);

	/* TODO: for each opponent, add new dimension? */
	for (let n = 0; n < numExamples; n++) {
		if (state[n] == null) {
			continue;
		}

		/* Mark self 
		state[n].s.forEach((yx, i) => {
			buff.set(i === 0 ? 2 : 1, n, yx[0], yx[1], 0);
		});
    */

		/* Mark env */
		state[n].e.forEach((pInputs, i) => {
			pInputs.forEach((input, j) => {
				buff.set(input, n, i, j, 0);
			});
		});
	}
	return buff.toTensor();
}
