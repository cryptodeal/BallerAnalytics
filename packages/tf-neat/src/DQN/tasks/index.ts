import { assertPositiveInt, getRandomInt } from '../utils';
import { buffer } from '@tensorflow/tfjs-node';

import type { Tensor, Rank } from '@tensorflow/tfjs-node';
import type {
	TeamOpts,
	TaskState,
	DraftTaskParams,
	TaskStepOutput,
	DQNRoster,
	PositionEnum
} from './types';
import { type DQNPlayer, PositionIdx } from '@balleranalytics/nba-api-ts';
import { PositionEncoded } from '@balleranalytics/nba-api-ts';

/* TODO: tune parameters */
export const VALID_ROSTER_REWARD = 10;
export const AVAIL_PLAYER_REWARD = 10;
export const FAILED_DRAFT_REWARD = -20;

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

		/* Mark self */
		state[n].s.forEach((yx, i) => {
			buff.set(i === 0 ? 2 : 1, n, yx[0], yx[1], 0);
		});

		/* Mark env */
		state[n].e.forEach((yx) => {
			buff.set(1, n, yx[0], yx[1], 1);
		});
	}

	return buff.toTensor();
}

export class Roster {
	public done = false;
	private opts: TeamOpts;
	public playerPool: DQNPlayer[] = [];
	private roster: DQNRoster = {
		pg: [],
		sg: [],
		sf: [],
		pf: [],
		c: [],
		g: [],
		f: [],
		util: [],
		be: []
	};
	private rosters: DQNRoster[] = [];

	constructor(opts: TeamOpts) {
		this.opts = opts;
		this.resetRoster();
	}

	public resetRoster(opts?: TeamOpts) {
		if (opts) this.opts = opts;

		const { pg, sg, sf, pf, c, g, f, util, be } = this.opts;
		this.roster['pg'] = new Array(pg);
		this.roster['sg'] = new Array(sg);
		this.roster['sf'] = new Array(sf);
		this.roster['pf'] = new Array(pf);
		this.roster['c'] = new Array(c);
		this.roster['g'] = new Array(g);
		this.roster['f'] = new Array(f);
		this.roster['util'] = new Array(util);
		this.roster['be'] = new Array(be);
	}

	private mapPositions = (player: DQNPlayer) => {
		//console.log('\nmapPositions:', player);
		const tempRoster = this.roster;
		const tempRosters = this.rosters;
		const tempOpts = this.opts;
		const positionEncd = player.positionEncd;
		const posVariations: DQNRoster[] = [];
		function mapRecursive(path: PositionEnum) {
			if (!tempRosters.length) {
				const posRoster = tempRoster;
				if (posRoster[path].filter((p) => p !== undefined).length < tempOpts[path]) {
					posRoster[path][0] = player;
					posVariations.push(posRoster);
				}
			} else {
				const rosterLength = tempRosters.length;
				for (let i = 0; i < rosterLength; i++) {
					const posRoster = tempRosters[i];
					if (posRoster[path].filter((p) => p !== undefined).length < tempOpts[path]) {
						posRoster[path].push(player);
						posVariations.push(posRoster);
					}
				}
			}
		}
		const [pg, sg, sf, pf, c, g, f] = positionEncd;
		mapRecursive('be');
		mapRecursive('util');
		if (pg) mapRecursive('pg');
		if (sg) mapRecursive('sg');
		if (sf) mapRecursive('sf');
		if (pf) mapRecursive('pf');
		if (c) mapRecursive('c');
		if (g) mapRecursive('g');
		if (f) mapRecursive('f');
		// console.log(posVariations);
		console.log('posVariations.length:', posVariations.length);
		if (!posVariations.length) this.done = true;
		this.rosters = posVariations;
	};

	public addPick(player: DQNPlayer) {
		this.playerPool.push(player);
		this.mapPositions(player);
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
	/* const to track draft round and pick */
	public round = 0;
	public current_pick_number = 0;

	/* draftPool is effectively the list of actions for the Agent Task */
	private draftPool: DQNPlayer[] = [];
	private dims: [number, number, number];
	private selfState: number[][] = [];
	private envState: number[][] = [];
	private teamOpts: TeamOpts;

	private pickSlot!: number;
	private draftOrder: number[] = [];
	private pick!: DQNPlayer;
	private roster: TeamOpts = {
		pg: 0,
		sg: 0,
		sf: 0,
		pf: 0,
		c: 0,
		g: 0,
		f: 0,
		util: 0,
		be: 0
	};

	constructor(args: DraftTaskParams) {
		const { all_actions, dimensions, teamOpts, oppCount } = args;
		this.dims = dimensions;
		/* ensure values are non neg int */
		assertPositiveInt(all_actions.length, 'all_actions.length');
		assertPositiveInt(oppCount, 'oppCount');
		assertPositiveInt(all_actions.length, 'this.num_actions');
		Object.values(teamOpts).map((x, i) => assertPositiveInt(x, `teamOpts[${i}]`));
		this.teamOpts = teamOpts;
		this.oppCount = oppCount;
		this.all_actions = all_actions;
		this.num_actions = all_actions.length;

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

	/**
	 * Reset the state of the task.
	 *
	 * Returns initial state of the game.
	 * See `getState()` docs for addtl details.
	 */
	reset() {
		this.init();
		this.envState = [];
		this.makeEnv();
		return this.getState();
	}

	/**
	 * Perform a step of the Task
	 *
	 * `action` The action to take in the current step.
	 *   The meaning of the possible values:
	 *     number: 0, 1, 2, etc... === idx of draftPick
	 */
	step(action: number): TaskStepOutput {
		const player = this.selfState[0];

		// Calculate the coordinates of the new head and check whether it has
		// gone off the board, in which case the game will end.
		let done;
		this.draftPlayer(action);

		/**
		 * TaskStepOutput
		 *   - `reward`: calc number value of reward
		 *   - `state`: new state of the game after the step.
		 *   - `milestone`: boolean indicating if DQN made pick
		 *   - `done`: boolean indicating whether task ended after step
		 */
		return {
			reward: 0,
			milestone: false,
			done: false
		};
	}

	private init() {
		/* reset state of task actor */
		this.selfState = [];
		/**
		 * Create Array<boolean> where length === # of teams in draft
		 * if this.draftOrder[i] === true, neural net make step
		 * else, simulate opponent picks
		 */
		this.pickSlot = getRandomInt(0, this.oppCount);
		this.draftOrder = [...Array(this.oppCount + 1).keys()];
	}

	private makeEnv() {
		// const numPlayers =
	}

	private draftPlayer(action: number) {
		this.pick = this.draftPool[action];
	}

	private validateRoster() {
		let done;
		const pick = this.pick;
		/* TODO: determine if pick ends game by violating position caps */
		const encdPosTemp: PositionEncoded = this.pick.positionEncd;
		const posIdx: number[] = [];
		for (let i = 0; i < 7; i++) {
			if (encdPosTemp[i] == 1) {
				posIdx.push(i);
			}
		}

		if (posIdx.length === 1) {
			const [idx] = posIdx;
			switch (idx) {
				case PositionIdx.PG: {
					if (
						this.roster.pg >= this.teamOpts.pg &&
						this.roster.be >= this.teamOpts.be &&
						this.roster.util >= this.teamOpts.util
					) {
						done = true;
					} else {
						if (this.roster.pg < this.teamOpts.pg) {
							this.roster.pg++;
						} else if (this.roster.be < this.teamOpts.be) {
							this.roster.be++;
						} else if (this.roster.util < this.teamOpts.util) {
							this.roster.util++;
						}
					}
					break;
				}
				case PositionIdx.SG: {
					if (
						this.roster.sg >= this.teamOpts.sg &&
						this.roster.be >= this.teamOpts.be &&
						this.roster.util >= this.teamOpts.util
					) {
						done = true;
					} else {
						if (this.roster.sg < this.teamOpts.sg) {
							this.roster.sg++;
						} else if (this.roster.be < this.teamOpts.be) {
							this.roster.be++;
						} else if (this.roster.util < this.teamOpts.util) {
							this.roster.util++;
						}
					}
					break;
				}
				case PositionIdx.SF: {
					if (
						this.roster.sf >= this.teamOpts.sf &&
						this.roster.be >= this.teamOpts.be &&
						this.roster.util >= this.teamOpts.util
					) {
						done = true;
					} else {
						if (this.roster.sf < this.teamOpts.sf) {
							this.roster.sf++;
						} else if (this.roster.be < this.teamOpts.be) {
							this.roster.be++;
						} else if (this.roster.util < this.teamOpts.util) {
							this.roster.util++;
						}
					}
					break;
				}
				case PositionIdx.PF: {
					if (
						this.roster.pf >= this.teamOpts.pf &&
						this.roster.be >= this.teamOpts.be &&
						this.roster.util >= this.teamOpts.util
					) {
						done = true;
					} else {
						if (this.roster.pf < this.teamOpts.pf) {
							this.roster.pf++;
						} else if (this.roster.be < this.teamOpts.be) {
							this.roster.be++;
						} else if (this.roster.util < this.teamOpts.util) {
							this.roster.util++;
						}
					}
					break;
				}
				case PositionIdx.C: {
					if (
						this.roster.c >= this.teamOpts.c &&
						this.roster.be >= this.teamOpts.be &&
						this.roster.util >= this.teamOpts.util
					) {
						done = true;
					} else {
						if (this.roster.c < this.teamOpts.c) {
							this.roster.c++;
						} else if (this.roster.be < this.teamOpts.be) {
							this.roster.be++;
						} else if (this.roster.util < this.teamOpts.util) {
							this.roster.util++;
						}
					}
					break;
				}
				case PositionIdx.G: {
					if (
						this.roster.g >= this.teamOpts.g &&
						this.roster.be >= this.teamOpts.be &&
						this.roster.util >= this.teamOpts.util
					) {
						done = true;
					} else {
						if (this.roster.g < this.teamOpts.g) {
							this.roster.g++;
						} else if (this.roster.be < this.teamOpts.be) {
							this.roster.be++;
						} else if (this.roster.util < this.teamOpts.util) {
							this.roster.util++;
						}
					}
					break;
				}
				default: {
					if (
						this.roster.f >= this.teamOpts.f &&
						this.roster.be >= this.teamOpts.be &&
						this.roster.util >= this.teamOpts.util
					) {
						done = true;
					} else {
						if (this.roster.f < this.teamOpts.f) {
							this.roster.c++;
						} else if (this.roster.be < this.teamOpts.be) {
							this.roster.be++;
						} else if (this.roster.util < this.teamOpts.util) {
							this.roster.util++;
						}
					}
					break;
				}
			}
		} else {
			/* TODO: determine if player w multiple positions fits roster */
		}
	}

	getState(): TaskState {
		return {
			s: this.selfState.slice(),
			e: this.envState.slice()
		};
	}
}
