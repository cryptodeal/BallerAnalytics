import {
	loadLayersModel,
	tensor,
	type Sequential,
	type Tensor,
	type Rank,
	dispose
} from '@tensorflow/tfjs-node';
import type { RosterDatumInputs, RosterEncd } from './types';

export class LeanRoster {
	private playerPool: RosterDatumInputs;
	private pickCount = 0;
	private model: Sequential;
	public done = false;
	public rosterVariants: RosterEncd[] = [];

	public disposeModel() {
		return this.model.dispose();
	}

	public getRosterInputs(): RosterDatumInputs {
		return this.playerPool;
	}

	private genRoster = (val: 0 | 1 = 0): RosterEncd => <RosterEncd>new Array(9).fill(val);

	constructor(model: Sequential) {
		this.model = model;
		this.playerPool = <RosterDatumInputs>new Array(13).fill(this.genRoster(1));
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
		const testRoster = <RosterDatumInputs>JSON.parse(JSON.stringify(this.playerPool));
		testRoster[this.pickCount] = pstnEncd;
		const inputs = tensor([this.playerPool], [1, 13, 9]);
		const predTensor = <Tensor<Rank>>this.model.predict(inputs);
		dispose(inputs);
		const value = predTensor.dataSync()[0];
		dispose(predTensor);

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
