import { assertPositiveInt, getRandomInt } from '../utils';
import { buffer } from '@tensorflow/tfjs-node';

import type { Tensor, Rank } from '@tensorflow/tfjs-node';
import type { TeamOpts, TaskState, DraftTaskParams, TaskStepOutput } from './types';
import type { Player } from '@balleranalytics/nba-api-ts';

/* TODO: tune parameters */
export const VALID_PICK_REWARD = 1;
export const NO_FRUIT_REWARD = -0.2;
export const FRUIT_REWARD = 10;
export const DEATH_REWARD = -10;

export enum Position {
	pg = 0,
	sg = 1,
	sf = 2,
	pf = 3,
	c = 4,
	g = 5
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

export class DraftTask {
	public all_actions: number[];
	public num_actions: number;
	public oppCount: number;
	/* const to track draft round and pick */
	public round = 0;
	public current_pick_number = 0;

	private dims: [number, number, number];
	private selfState: number[][] = [];
	private envState: number[][] = [];
	private teamOpts: TeamOpts;

	private pickSlot!: number;
	private draftOrder: number[] = [];
	private pick!: Player;
	private rosterSlots: TeamOpts = {
		pg: 0,
		sg: 0,
		sf: 0,
		pf: 0,
		c: 0,
		g: 0,
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

		/* TODO: determine if pick ends game by violating position caps */
		if (this.pick.position) {
		}
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

	private draftPlayer(action: number) {
		return;
	}

	getState(): TaskState {
		return {
			s: this.selfState.slice(),
			e: this.envState.slice()
		};
	}
}
