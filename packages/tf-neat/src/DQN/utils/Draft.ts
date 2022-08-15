import { DQNPlayer } from '@balleranalytics/nba-api-ts';
import { util } from '@tensorflow/tfjs-node';
import { getRandomInt } from '.';
import { TeamOpts } from '../tasks/types';
import { DraftOpp } from './Opp';

export class Scaler {
	private inMin: number;
	private inMax: number;
	private outMin: number;
	private outMax: number;
	constructor(inMin: number, inMax: number, outMin: number, outMax: number) {
		this.inMin = inMin;
		this.inMax = inMax;
		this.outMin = outMin;
		this.outMax = outMax;
	}

	scale(value: number | number[]) {
		if (typeof value === 'number') {
			const result =
				((value - this.inMin) * (this.outMax - this.outMin)) / (this.inMax - this.inMin) +
				this.outMin;

			if (result < this.outMin) {
				return this.outMin;
			} else if (result > this.outMax) {
				return this.outMax;
			}

			return result;
		} else {
			return value.map((v) => this.scale(v));
		}
	}
}

export class DraftAPI {
	public players: DQNPlayer[];
	public rewards: number[];
	public teamCount = 0;
	public draftOrder: number[];
	public opps: DraftOpp[];

	private Scaler!: Scaler;

	constructor(players: DQNPlayer[], oppCount = 0, rosterOpts: TeamOpts) {
		this.players = players;
		this.teamCount = oppCount + 1;
		this.draftOrder = this.genDraftOrder();
		util.shuffle(this.players);
		this.rewards = this.resetRewards();
		this.opps = new Array(oppCount);
		for (let i = 0; i < oppCount; i++) {
			this.opps[i] = new DraftOpp(rosterOpts, i + 2);
		}
	}

	public getPlayerInputs(idx: number) {
		return this.players[idx].inputs;
	}

	public getPlayer(idx: number) {
		return this.players[idx];
	}

	public getReward(idx: number, scale = 1) {
		return this.rewards[idx] * scale;
	}

	public flagDrafted(playerIdx: number, teamNo = 1) {
		this.players[playerIdx].flagDrafted(teamNo);
	}

	public isPlayerAvail(idx: number) {
		// console.log(this.players.length, idx, this.players[idx]?.inputs);
		return this.players[idx].inputs[67] === 0;
	}

	/* TODO: intelligently simulate picks randomly to fill team roster?? */
	public simulatePick(teamNo: number) {
		const oppIdx = this.opps.findIndex((opp) => opp.isPickSlot(teamNo));
		if (oppIdx === -1) throw new Error(`Error: cannot find DraftOpp w pickSlot ${teamNo}`);
		const opp = this.opps[oppIdx];
		const needsPositions = opp.needsPositions();
		let avail: DQNPlayer[] = [];
		if (!needsPositions.length) {
			// console.log(`any player valid`);
			avail = this.players.filter((p) => p.inputs[67] === 0);
		} else {
			// console.log(`needs position players`);
			avail = this.players.filter((p) => p.inputs[67] === 0 && p.inputs[needsPositions[0]] === 1);
			if (avail.length === 0) avail = this.players.filter((p) => p.inputs[67] === 0);
		}

		// console.log('avail:', avail + '\n', 'avail count:', avail.length);
		const pick = avail[getRandomInt(0, avail.length)];

		const pickIdx = this.players.findIndex((p) => p.getId() === pick?.getId());
		if (pickIdx === -1) {
			console.log(`failed to draft in final round`);
			console.log(`TODO: optimize DraftOpp algo + Roster algo (cartesian prods??)`);
			return -1;
		} else {
			this.flagDrafted(pickIdx);
			return pickIdx;
		}
	}

	public reverseDraftOrder() {
		this.draftOrder.reverse();
	}

	public reset() {
		this.players.map((p) => p.resetDrafted());
		this.draftOrder = this.genDraftOrder();
		util.shuffle(this.players);
		this.rewards = this.resetRewards();
	}

	private resetRewards() {
		const rewardsArr = this.players.map((p) => p.reward);

		if (!this.Scaler) {
			const inMin = Math.min(...rewardsArr);
			const inMax = Math.max(...rewardsArr);
			const outMin = 1;
			const outMax = 3;
			this.Scaler = new Scaler(inMin, inMax, outMin, outMax);
		}
		return this.Scaler.scale(rewardsArr);
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

	private minMaxScale = (inputs: number[], minZero: boolean, base?: number) => {
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
			scaled[i] = (inputs[i] - min) / max + (base ? base : 0);
		}
		return scaled;
	};
}
