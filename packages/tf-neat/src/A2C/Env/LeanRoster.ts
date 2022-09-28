import {
	loadLayersModel,
	tensor,
	type Sequential,
	type Tensor,
	type Rank,
	tidy,
	zeros
} from '@tensorflow/tfjs-node';
import type { RosterDatumInputs, RosterEncd } from './types';

export class LeanRoster {
	private playerPool: RosterDatumInputs;
	private pickCount = 0;
	private model: Sequential;
	public done = false;
	public rosterVariants: RosterEncd[] = [];

	public disposeModel() {
		this.model.optimizer.dispose();
		this.model.dispose();
	}

	public getRosterInputs(): RosterDatumInputs {
		return this.playerPool;
	}

	private genRoster = (val: 0 | 1 = 0): RosterEncd => <RosterEncd>new Array(9).fill(val);

	constructor(model: Sequential) {
		this.model = model;
		this.warmUp();
		this.playerPool = <RosterDatumInputs>new Array(13).fill(this.genRoster(1));
	}

	public warmUp() {
		tidy(() => {
			const input = zeros([1, 13, 9]);
			this.model.predict(input);
		});
	}

	static async loadModel() {
		const filePath = `${process.cwd()}/data/roster_validator_model/model.json`;
		return <Sequential>await loadLayersModel('file://' + filePath);
	}

	private totalCount = (arr: number[]): Map<number, number> =>
		arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());

	public addPick(pstnEncd: RosterEncd, forcePick = false) {
		const { isValid, value } = this.testPick(pstnEncd);
		if (!isValid && !forcePick)
			return {
				isValid,
				value
			};

		this.playerPool[this.pickCount] = pstnEncd;
		this.pickCount += 1;
		if (!isValid) this.done = true;

		return {
			value,
			isValid
		};
	}

	public testPick(pstnEncd: RosterEncd) {
		const testRoster = <RosterDatumInputs>structuredClone(this.playerPool);
		testRoster[this.pickCount] = pstnEncd;

		const value = tidy(() => {
			const inputs = tensor([testRoster], [1, 13, 9]);
			const predTensor = <Tensor<Rank>>this.model.predict(inputs);
			return predTensor.dataSync()[0];
		});

		return {
			value,
			isValid: value > 0.5 ? true : false
		};
	}

	public reset() {
		this.pickCount = 0;
		this.done = false;
		this.playerPool = <RosterDatumInputs>new Array(13).fill(this.genRoster(1));
	}
}
