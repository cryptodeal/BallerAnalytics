import { util } from '@tensorflow/tfjs-node';
import { DraftOpp } from './Opp';

export type TeamOpts = Record<string, number>;

export class EnvController {
	private booleanStateAttributes = {
		onRoster: true,
		pg: true,
		sg: true,
		sf: true,
		pf: true,
		c: true,
		g: true,
		f: true
	};
	private numbericStateAttributes = {};

	public players: any[];
	public rewards: number[];
	public actionCount: number;
	public teamCount = 0;
	public draftOrder: number[];
	public opps: any[];
	public stateCount: number;

	/* Environment */
	public states: any[];
	public actions: any[];
	public actionsIdx: any[];

	/* Variables */
	public currentState: any;
	public currentAction: any[];
	public currentReward: number;
	public episodeLength = 0;
	public currentStep = 0;

	constructor(players: any[], oppCount = 0, rosterOpts?: TeamOpts) {
		this.players = players;
		this.actionCount = players.length;
		this.teamCount = oppCount + 1;
		this.draftOrder = this.genDraftOrder();
		util.shuffle(this.players);
		this.rewards = this.resetRewards();
		this.opps = new Array(oppCount);
		for (let i = 0; i < oppCount; i++) {
			this.opps[i] = new DraftOpp({}, i + 2);
		}
	}

	/**
	 * Create number[], length is # of teams;
	 * each position in array has original # of idx as value
	 * used to run snake draft
	 */
	private genDraftOrder() {
		const order = [...Array(this.teamCount).keys()].map((i) => i + 1);
		util.shuffle(order);
		return order;
	}

	private resetRewards() {
		return this.minMaxScale(
			this.players.map((p) => p.reward),
			true
		);
	}

	public reset() {
		this.currentStep = 0;
		// TODO: FIX THIS - this.episodeLength = current_website.urls.length;
		this.players.map((p) => p.resetDrafted());
		this.draftOrder = this.genDraftOrder();
		// util.shuffle(this.players);
		this.rewards = this.resetRewards();
	}

	private minMaxScale(inputs: number[], minZero = false) {
		let min = minZero ? 0 : Infinity;
		let max = -Infinity;
		const count = inputs.length;
		for (let i = 0; i < count; i++) {
			min = Math.min(inputs[i], min);
			max = Math.max(inputs[i], max);
		}
		max -= min;

		const scaled: number[] = new Array(count);
		for (let i = 0; i < count; i++) {
			scaled[i] = (inputs[i] - min) / max;
		}
		return scaled;
	}

	public getEnvData() {
		return {
			states: this.states,
			actions: this.actions,
			currentState: this.currentState,
			currentAction: this.currentAction,
			episodeLength: this.episodeLength,
			actionsIdx: this.actionsIdx,
			currentStep: this.currentStep
		};
	}

	public initStates() {
		this.states = [];
		for (const key in this.booleanStateAttributes) {
			if (this.booleanStateAttributes[key]) this.states.push([true, false]);
		}
	}
}
