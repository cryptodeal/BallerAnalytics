import { DQNPlayer } from '@balleranalytics/nba-api-ts';
import { util } from '@tensorflow/tfjs-node';
import { getRandomInt } from '.';
import { TeamOpts } from '../tasks/types';
import { DraftOpp } from './Opp';

export class DraftAPI {
	public players: DQNPlayer[];
	public rewards: number[];
	public teamCount = 0;
	public draftOrder: number[];
	public opps: DraftOpp[];

	constructor(players: DQNPlayer[], oppCount = 0, rosterOpts?: TeamOpts) {
		this.players = players;
		this.teamCount = oppCount + 1;
		this.draftOrder = this.genDraftOrder();
		util.shuffle(this.players);
		this.rewards = this.resetRewards();
		this.opps = new Array(oppCount);
		for (let i = 0; i < oppCount; i++) {
			this.opps[i] = new DraftOpp({}, i + 2);
		}
	}

	public getPlayerInputs(idx: number) {
		return this.players[idx].inputs;
	}

	public getPlayer(idx: number) {
		return this.players[idx];
	}

	public getReward(idx: number, scale = 15) {
		return this.rewards[idx] * scale;
	}

	public flagDrafted(playerIdx: number, teamNo = 1) {
		this.players[playerIdx].flagDrafted(teamNo);
	}

	public isPlayerAvail(idx: number) {
		return this.players[idx].inputs[67] === 0;
	}

	/* TODO: intelligently simulate picks randomly to fill team roster?? */
	public simulatePick(teamNo: number) {
		const oppIdx = this.opps.findIndex((opp) => opp.isPickSlot(teamNo));
		if (oppIdx === -1) throw new Error(`Error: cannot find DraftOpp w pickSlot ${teamNo}`);
		const opp = this.opps[oppIdx];
		const needsPositions = opp.needsPositions();
		const avail = needsPositions.length
			? this.players.filter((p) => p.inputs[67] === 0 && p.inputs[needsPositions[0]] === 1)
			: this.players.filter((p) => p.inputs[67] === 0);
		const pick = avail[getRandomInt(0, avail.length)];
		const pickIdx = this.players.findIndex((p) => p === pick);
		this.flagDrafted(pickIdx, teamNo);
		return pickIdx;
	}

	public reverseDraftOrder() {
		this.draftOrder.reverse();
	}

	public reset() {
		this.players.map((p) => p.resetDrafted());
		this.draftOrder = this.genDraftOrder();
		// util.shuffle(this.players);
		this.rewards = this.resetRewards();
	}

	private resetRewards() {
		return this.minMaxScale(
			this.players.map((p) => p.reward),
			true
		);
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

	private minMaxScale = (inputs: number[], minZero = false) => {
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
	};
}
