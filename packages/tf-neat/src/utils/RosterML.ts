import {
	sequential,
	train,
	layers,
	losses,
	util,
	type Sequential,
	tensor
} from '@tensorflow/tfjs-node';
import { readFile } from 'fs/promises';
import { RosterDataSet, RosterDatumInputs } from '../A2C/Env';

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

	public async trainModel() {
		const xs = tensor(this.train_inputs);
		const ys = tensor(this.train_labels);
		await this.model.fit(xs, ys, {
			batchSize: 32,
			epochs: 5000,
			shuffle: true,
			validationSplit: 0.25
		});
	}

	public saveModel() {
		const filePath = `${process.cwd()}/data/roster_validator_model.json`;
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
