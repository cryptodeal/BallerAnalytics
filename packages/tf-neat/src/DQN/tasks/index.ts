import { assertPositiveInt, getRandomInt } from '../utils';
import { buffer } from '@tensorflow/tfjs-node';
import type { Tensor, Rank } from '@tensorflow/tfjs-node';
import type {
	TeamOpts,
	TaskState,
	DraftTaskParams,
	TaskStepOutput,
	DQNRoster,
	DQNRosterLean
} from './types';
import { DQNPlayer, DQNPlayerLean } from '@balleranalytics/nba-api-ts';
import { DraftAPI } from '../utils/Draft';

/* TODO: tune parameters */
export const VALID_ROSTER_REWARD = 5;
export const INVALID_ROSTER_REWARD = -5;
export const AVAIL_PLAYER_REWARD = 5;
export const UNAVAIL_PLAYER_REWARD = -5;
export const FAILED_DRAFT_REWARD = -5;
export const COMPLETED_DRAFT_REWARD = 10;

export class Roster {
	public done = false;
	private opts: TeamOpts;
	public playerPool: DQNPlayer[] = [];
	private roster: DQNRoster = {} as DQNRoster;
	private leanRosters: DQNRosterLean[] = [];
	constructor(opts: TeamOpts) {
		this.opts = opts;
		this.resetRoster();
	}

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

	private testOnCurrentRoster(player: DQNPlayerLean, roster: DQNRoster) {
		if (player.be) {
			const tempRoster: DQNRoster = { ...roster };
		}
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
}

export class DraftTask {
	public all_actions: number[];
	public num_actions: number;
	public oppCount: number;
	public teamRoster: Roster;
	/* const to track draft round and pick */
	public round = 0;
	public current_pick_number = 0;

	private draftApi: DraftAPI;
	private dims: [number, number, number];
	/* TODO: store all state in 1 array/buffer (i.e. manipulating state tensor) */
	private selfState: number[][] = [];
	private envState: number[][] = [];
	private teamOpts: TeamOpts;
	public pickSlot!: number;
	private pick!: DQNPlayer;

	constructor(args: DraftTaskParams) {
		const { all_actions, dimensions, teamOpts, oppCount } = args;
		this.draftApi = new DraftAPI(all_actions);
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
		this.teamRoster.resetRoster(this.teamOpts);
		this.initEnv();
		return this.getState();
	}

	simulatePick(teamNo: number) {
		const pick = this.draftApi.simulatePick(teamNo);
		this.envState[pick] = this.draftApi.getPlayerInputs(pick);
	}

	/**
	 * Perform a step of the Task
	 *
	 * `action` The action to take in the current step.
	 *   The meaning of the possible values:
	 *     number: 0, 1, 2, etc... === idx of draftPick
	 */
	step(action: number): TaskStepOutput {
		let done = false,
			reward = 0;
		const validPick = this.draftPlayer(action);
		this.teamRoster.addPick(this.pick);

		if (!validPick) {
			done = true;
			reward += UNAVAIL_PLAYER_REWARD;
		} else {
			reward = AVAIL_PLAYER_REWARD;
		}

		if (this.teamRoster.done) {
			done = true;
			reward += INVALID_ROSTER_REWARD;
		} else {
			reward += VALID_ROSTER_REWARD;
		}

		let milestone = false;
		if (done) {
			reward += FAILED_DRAFT_REWARD;
			return { reward, done, milestone };
		}

		milestone = true;
		reward += this.draftApi.getReward(action);
		if (this.selfState.length === 13) reward += COMPLETED_DRAFT_REWARD;
		this.selfState.unshift(this.pick.inputs);
		console.log(this.selfState.length);

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
		this.pickSlot = getRandomInt(0, this.oppCount + 1);
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
