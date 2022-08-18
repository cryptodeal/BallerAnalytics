import { tensor, concat, util, tidy } from '@tensorflow/tfjs-node';
import { readFile } from 'fs/promises';
import { Genome } from '../../../src/core/neat/Genome';
import { TFGenome } from '../../../src/core/neat/TFGenome';
import { Neat, type RandGenomeOpts } from '../../../src/core/neat';
import type { Tensor, Rank } from '@tensorflow/tfjs-node';
import { RosterDataSet, RosterDatum } from '../../A2C/Env';
async function loadData() {
	const path = process.cwd() + '/data/rosterDataset.json';
	const { data } = <RosterDataSet>JSON.parse(await readFile(path, 'utf8'));
	return data;
}

/* TODO: rewrite function to train NEAT model on draft */
const trainNeat = async (batchSize = 16) => {
	const tempData = (await loadData()).filter(({ inputs }) => inputs.flat().length === 13 * 9);
	const tempCount = tempData.length;

	const failed = tempData.filter(({ labels }) => labels[0] === 0);
	const valid = tempData.filter(({ labels }) => labels[0] === 1);
	util.shuffle(valid);
	const failedCount = failed.length;
	console.log(`${failedCount} failed out of ${tempCount}`);
	const rosterData = [...failed, ...valid.slice(0, failedCount * 2)];
	const count = rosterData.length;
	console.log(`processed/usable: ${count}`);
	// players.map((p, i) => console.log(i + ':', p ? p.name : p));

	const evalFitness = (gen: Genome) => {
		/* select batch, size `batchSize`, unique random players */
		const testRosters: RosterDatum[] = rosterData.slice(0, batchSize);
		/* batch predictions */

		return tidy(() => {
			const batchPreds: Tensor<Rank> = concat(
				testRosters.map(
					(p) =>
						TFGenome.toTFGraph(
							gen,
							p.inputs.flat().map((i) => [i])
						)[0]
				)
			);
			const batchLabels: Tensor<Rank> = concat(testRosters.map(({ labels }) => tensor(labels)));

			const mse = (preds: Tensor<Rank>, labels: Tensor<Rank>) => preds.sub(labels).square().mean();
			const fitness = -mse(batchPreds, batchLabels).dataSync()[0];
			return fitness;
		});
	};

	const randGenomeOpts: RandGenomeOpts = { input: 13 * 9, out: 1, maxHidden: 1, linkProb: 0.5 };

	const neat = new Neat(randGenomeOpts, evalFitness, {
		fillInitGen: true,
		dropoff: 25,
		mutateBoost: {
			enabled: true,
			startThreshold: 0.6,
			maxMutateRate: 0.7
		},
		populationSize: 64
	});

	let bestFitness = -Infinity;
	while (bestFitness < -0.001) {
		util.shuffle(rosterData);
		const { generation, highestFitness, species, connections, nodes } = neat.nextGeneration();
		if (highestFitness > bestFitness) bestFitness = highestFitness;
		console.log(
			`Generation: ${generation}; highestFitness: ${highestFitness}; species: ${species}; connections: ${connections}; nodes: ${nodes}`
		);
	}

	const genome = neat.fittestGenome as Genome;
	for (let i = 0; i < count; i++) {
		const { inputs, labels } = rosterData[i];
		const { pred, fitness } = tidy(() => {
			const outputTensor = TFGenome.toTFGraph(
				genome,
				inputs.flat().map((i) => [i])
			)[0];

			const mse = (preds: Tensor<Rank>, labels: Tensor<Rank>) => preds.sub(labels).square().mean();
			const fitness = -mse(outputTensor, tensor(labels)).dataSync()[0];

			const pred = outputTensor.dataSync()[0];
			return { pred, fitness };
		});

		console.log(JSON.stringify(genome));

		console.log('prediction:', pred, 'actual:', labels[0], 'fitness:', fitness);
	}
};

trainNeat();
