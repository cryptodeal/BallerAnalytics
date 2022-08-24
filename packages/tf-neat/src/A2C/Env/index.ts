import { assertPositiveInt, getRandomInt } from '../../DQN/utils';
import { buffer } from '@tensorflow/tfjs-node';
import { DraftAPI } from '../../DQN/utils/Draft';
import { LeanRoster } from './LeanRoster';

import type { Tensor, Rank, Sequential } from '@tensorflow/tfjs-node';
import type { TeamOpts, TaskState, DraftTaskParams, TaskStepOutput } from '../../DQN/tasks/types';
import type { DQNPlayer } from '@balleranalytics/nba-api-ts';

/* TODO: tune parameters */
/* TODO: Test variations of reward vals */
export const INVALID_ROSTER_REWARD = -1.5;
export const UNAVAIL_PLAYER_REWARD = -1.5;
export const FAILED_DRAFT_REWARD = -1.5;
export const COMPLETED_DRAFT_REWARD = 2;

export class DraftTask {
	public all_actions: number[];
	public num_actions: number;
	public oppCount: number;
	public teamRoster: LeanRoster;
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

	constructor(args: DraftTaskParams, model: Sequential) {
		const { all_actions, dimensions, teamOpts, oppCount } = args;
		this.draftApi = new DraftAPI(all_actions, teamOpts, oppCount, model);
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
		this.teamRoster = new LeanRoster(model);

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
		this.teamRoster.reset();
		this.initEnv();
		return this.getState();
	}

	public testActorPick(pick: number) {
		return this.teamRoster.testPick(this.draftApi.getPlayer(pick).getRosterEncoding()).isValid;
	}

	simulatePriorPicks(teamNo: number) {
		console.log(`simulating prior picks in round`);
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
			if (pick !== -1) this.envState[pick] = this.draftApi.getPlayerInputs(pick);
		}
	}

	simulateLaterPicks(teamNo: number) {
		console.log(`simulating remaining picks in round`);
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
			if (pick !== -1) this.envState[pick] = this.draftApi.getPlayerInputs(pick);
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
		this.teamRoster.addPick(this.pick.getRosterEncoding(), true);
		/* TODO: capture state here, but only return if not done */
		// const state = this.getState(),

		if (!validPick) {
			console.log(`invalid pick; failed`);
			done = true;
			reward += UNAVAIL_PLAYER_REWARD;
			/* Negative Saltation: https://www.hindawi.com/journals/mpe/2019/7619483/ */
			if (this.selfState.length > 7) reward += UNAVAIL_PLAYER_REWARD / 3;
		}

		if (this.teamRoster.done) {
			console.log(`team roster failed`);
			done = true;
			reward += INVALID_ROSTER_REWARD;
			/* Negative Saltation: https://www.hindawi.com/journals/mpe/2019/7619483/ */
			if (this.selfState.length > 7) reward += INVALID_ROSTER_REWARD / 3;
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
		if (this.selfState.length === 13) reward += COMPLETED_DRAFT_REWARD;

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
