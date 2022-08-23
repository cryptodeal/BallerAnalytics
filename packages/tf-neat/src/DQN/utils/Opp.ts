import type { TeamOpts } from '../tasks/types';
import type { Sequential } from '@tensorflow/tfjs-node';
import { DQNPlayer } from '@balleranalytics/nba-api-ts';
import { LeanRoster } from '../../A2C/Env/LeanRoster';

export type OppPositions = 'pg' | 'sg' | 'sf' | 'pf' | 'c' | 'g' | 'f';
export type OppRosterSlots = OppPositions | ('util' | 'be');
export enum PositionsIdxs {
	PG = 68,
	SG,
	SF,
	PF,
	C,
	G,
	F
}

export class DraftOppMl {
	public roster: LeanRoster;
	public pickSlot: number;

	constructor(opts: TeamOpts, pickSlot: number, model: Sequential) {
		this.roster = new LeanRoster(model);
		this.pickSlot = pickSlot;
	}

	public isPickSlot = (slot: number) => {
		return this.pickSlot === slot;
	};

	public makeDraftPick(player: DQNPlayer) {
		this.roster.addPick(player.getRosterEncoding());
	}

	public testPick(player: DQNPlayer) {
		return this.roster.testPick(player.getRosterEncoding());
	}
}

export class DraftOpp {
	public roster: Record<OppRosterSlots, (DQNPlayer | null)[]>;
	public pickSlot: number;
	public players: DQNPlayer[] = [];

	constructor(opts: TeamOpts, pickSlot: number) {
		const { pg, sg, sf, pf, c, g, f, util, be } = opts;

		this.roster = {
			pg: new Array(pg).fill(null),
			sg: new Array(sg).fill(null),
			sf: new Array(sf).fill(null),
			pf: new Array(pf).fill(null),
			c: new Array(c).fill(null),
			g: new Array(g).fill(null),
			f: new Array(f).fill(null),
			util: new Array(util).fill(null),
			be: new Array(be).fill(null)
		};
		this.pickSlot = pickSlot;
	}

	public isPickSlot = (slot: number) => {
		return this.pickSlot === slot;
	};

	public needsPositions = (): number[] => {
		const positions: number[] = [];
		const positionKeys = Object.keys(this.roster);
		for (let i = 0; i < positionKeys.length; i++) {
			const key = positionKeys[i];
			const value = this.roster[key];
			if (key === 'pg' && value.includes(null)) {
				positions.push(PositionsIdxs.PG);
			}
			if (key === 'sg' && value.includes(null)) {
				positions.push(PositionsIdxs.SG);
			}
			if (key === 'sf' && value.includes(null)) {
				positions.push(PositionsIdxs.SF);
			}
			if (key === 'pf' && value.includes(null)) {
				positions.push(PositionsIdxs.PF);
			}
			if (key === 'c' && value.includes(null)) {
				positions.push(PositionsIdxs.C);
			}
			if (key === 'g' && value.includes(null)) {
				positions.push(PositionsIdxs.G);
			}
			if (key === 'f' && value.includes(null)) {
				positions.push(PositionsIdxs.F);
			}
		}
		return positions;
	};

	private isBenchReady(): boolean {
		return (
			!this.roster.pg.includes(null) &&
			!this.roster.sg.includes(null) &&
			!this.roster.sf.includes(null) &&
			!this.roster.pf.includes(null) &&
			!this.roster.c.includes(null) &&
			!this.roster.g.includes(null) &&
			!this.roster.f.includes(null) &&
			!this.roster.util.includes(null)
		);
	}

	private findNullIdx = (position: OppRosterSlots) => {
		return this.roster[position].findIndex((p) => p === null);
	};

	public makeDraftPick = (player: DQNPlayer, position: PositionsIdxs) => {
		switch (position) {
			case PositionsIdxs.PG:
				this.roster.pg[this.findNullIdx('pg')] = player;
				break;
			case PositionsIdxs.SG:
				this.roster.sg[this.findNullIdx('sg')] = player;
				break;
			case PositionsIdxs.SF:
				this.roster.sf[this.findNullIdx('sf')] = player;
				break;
			case PositionsIdxs.PF:
				this.roster.pf[this.findNullIdx('pf')] = player;
				break;
			case PositionsIdxs.C:
				this.roster.c[this.findNullIdx('c')] = player;
				break;
			case PositionsIdxs.G:
				this.roster.g[this.findNullIdx('g')] = player;
				break;
			case PositionsIdxs.F:
				this.roster.f[this.findNullIdx('f')] = player;
				break;
			default:
				if (!this.isBenchReady()) {
					this.roster.util[this.findNullIdx('util')] = player;
				} else {
					this.roster.be[this.findNullIdx('be')] = player;
				}
				break;
		}
		this.players.push(player);
	};
}
