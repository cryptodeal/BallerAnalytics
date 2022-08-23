import {
	sequential,
	train,
	layers,
	losses,
	util,
	type Sequential,
	tensor,
	dispose,
	Tensor,
	Rank,
	tidy
} from '@tensorflow/tfjs-node';
import { com } from 'percom';
import { PositionIdx, RosterEncd } from '@balleranalytics/nba-api-ts';
import { readFile } from 'fs/promises';
import combinate from 'combinate';

import type { RosterDataSet, RosterDatumInputs } from '../A2C/Env/types';

export class RosterML {
	public model: Sequential;

	public data_size = 0;
	public train_inputs: RosterDatumInputs[] = [];
	public train_labels: [0 | 1][] = [];

	constructor() {
		this.model = sequential();
		/* verify input shape */
		this.model.add(layers.dense({ units: 13, inputShape: [13, 9], activation: 'tanh' }));
		this.model.add(layers.dense({ units: 26, activation: 'relu' }));
		this.model.add(layers.dense({ units: 9, activation: 'sigmoid' }));
		this.model.add(layers.flatten({}));
		this.model.add(layers.dense({ units: 1, activation: 'sigmoid' }));
		const optimizer = train.sgd(0.001);

		this.model.compile({
			optimizer: optimizer,
			loss: losses.meanSquaredError,
			metrics: ['accuracy', 'mse']
		});
	}

	static getAllEncodings() {
		const values = {
			0: [0, 1],
			1: [0, 1],
			2: [0, 1],
			3: [0, 1],
			4: [0, 1],
			5: [0, 1],
			6: [0, 1],
			7: [1],
			8: [1]
		};

		const combos = combinate(values).map(
			(c) => <RosterEncd>[c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8]]
		);
		console.log(combos);
		return combos;
	}

	public getAllRosters() {
		const values = {
			0: [0, 1],
			1: [0, 1],
			2: [0, 1],
			3: [0, 1],
			4: [0, 1],
			5: [0, 1],
			6: [0, 1],
			7: [1],
			8: [1]
		};

		const combinations = combinate(values);
		const PG = combinations.filter((v) => v[PositionIdx.PG] === 1);
		const SG = combinations.filter((v) => v[PositionIdx.SG] === 1);
		const SF = combinations.filter((v) => v[PositionIdx.SF] === 1);
		const PF = combinations.filter((v) => v[PositionIdx.PF] === 1);
		const C = combinations.filter((v) => v[PositionIdx.C] === 1);
		const G = combinations.filter((v) => v[PositionIdx.G] === 1);
		const F = combinations.filter((v) => v[PositionIdx.F] === 1);
		const rosterValues = {
			PG,
			SG,
			SF,
			PF,
			C,
			G,
			F,
			UTIL: com(combinations, 3),
			BE: com(combinations, 3)
		};
		const allRosters = combinate(rosterValues);
		console.log(allRosters.length);
	}

	public async trainModel() {
		const xs = tensor(this.train_inputs);
		const ys = tensor(this.train_labels);
		await this.model.fit(xs, ys, {
			batchSize: 32,
			epochs: 5000,
			shuffle: true,
			validationSplit: 0.25
		});
		dispose(xs);
		dispose(ys);
	}

	public predict(inputs: RosterDatumInputs) {
		return tidy(() => {
			const inputTensor = tensor([inputs], [1, 13, 9]);
			const predTensor = <Tensor<Rank>>this.model.predict(inputTensor);
			return predTensor.dataSync()[0];
		});
	}

	public saveModel() {
		const filePath = `${process.cwd()}/data/roster_validator_model/model.json`;
		return this.model
			.save('file://' + filePath)
			.then(() => `saved roster_validator_model to ${filePath}`);
	}

	public async loadData() {
		const path = process.cwd() + '/data/rosterDataset.json';
		const { data: temp } = <RosterDataSet>JSON.parse(await readFile(path, 'utf8'));

		const tempData = temp.filter(({ inputs }) => inputs.flat().length === 13 * 9);
		const tempCount = tempData.length;

		const failed = tempData.filter(({ labels }) => labels[0] === 0);
		const valid = tempData.filter(({ labels }) => labels[0] === 1);
		util.shuffle(valid);
		const failedCount = failed.length;
		console.log(`${failedCount} failed out of ${tempCount}`);
		const data = [...failed, ...valid.slice(0, failedCount * 2)];
		const count = data.length;
		console.log(`processed/usable: ${count}`);

		this.train_inputs = new Array(count);
		this.train_labels = new Array(count);
		for (let i = 0; i < count; i++) {
			this.data_size++;
			const { inputs, labels } = data[i];
			this.train_inputs[i] = inputs;
			this.train_labels[i] = labels;
		}
	}
}
