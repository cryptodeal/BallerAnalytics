import { assertPositiveInt, getRandomInt } from '../utils';
import { buffer } from '@tensorflow/tfjs-node';

import type { TeamOpts, TaskParams, TaskState } from './types';

const DEFAULT_HEIGHT = 16;
const DEFAULT_WIDTH = 16;
const DEFAULT_NUM_FRUITS = 1;
const DEFAULT_INIT_LEN = 4;

// TODO(cais): Tune these parameters.
export const NO_FRUIT_REWARD = -0.2;
export const FRUIT_REWARD = 10;
export const DEATH_REWARD = -10;
// TODO(cais): Explore adding a "bad fruit" with a negative reward.

export const ACTION_GO_STRAIGHT = 0;
export const ACTION_TURN_LEFT = 1;
export const ACTION_TURN_RIGHT = 2;

export const ALL_ACTIONS = [ACTION_GO_STRAIGHT, ACTION_TURN_LEFT, ACTION_TURN_RIGHT];
export const NUM_ACTIONS = ALL_ACTIONS.length;

export const getRandomAction = (numActions: number) => {
	return getRandomInt(0, numActions);
};

export function getStateTensor(state, h: number, w: number) {
	if (!Array.isArray(state)) {
		state = [state];
	}
	const numExamples = state.length;
	// TODO(cais): Maintain only a single buffer for efficiency.
	const buff = buffer([numExamples, h, w, 2]);

	for (let n = 0; n < numExamples; ++n) {
		if (state[n] == null) {
			continue;
		}
		// Mark the snake.
		state[n].s.forEach((yx, i) => {
			buff.set(i === 0 ? 2 : 1, n, yx[0], yx[1], 0);
		});

		// Mark the fruit(s).
		state[n].f.forEach((yx) => {
			buff.set(1, n, yx[0], yx[1], 1);
		});
	}
	return buff.toTensor();
}

export class Task {
	public selfState: number[][] = [];
	private envState: number[][] = [];
	private dimensions: [number, number];
	public all_actions: number[];
	public num_actions: number;
	public teamOpts: TeamOpts;

	constructor(args: TaskParams) {
		const { all_actions, numPlayers, teamOpts, dimensions } = args;
		this.dimensions = dimensions;
		/* ensure values are non neg int */
		assertPositiveInt(numPlayers, 'numPlayers');
		assertPositiveInt(all_actions.length, 'all_actions.length');
		Object.values(teamOpts).map((x, i) => assertPositiveInt(x, `teamOpts[${i}]`));
		assertPositiveInt(all_actions.length, 'this.num_actions');

		this.teamOpts = teamOpts;
		this.all_actions = all_actions;
		this.num_actions = all_actions.length;
		this.teamOpts = teamOpts;

		this.reset();
	}

	get dimension1() {
		return this.dimensions[0];
	}

	get dimension2() {
		return this.dimensions[0];
	}
	/**
	 * Reset the state of the task.
	 *
	 * Returns initial state of the game.
	 * See `getState()` docs for addtl details.
	 */
	reset() {
		this.initTask();
		// this.initializeSnake_();
		// this.fruitSquares_ = null;
		// this.makeFruits_();
		return this.getState();
	}

	private initTask() {
		this;
	}

	getState(): TaskState {
		return {
			s: this.selfState.slice(),
			e: this.envState.slice()
		};
	}
}
