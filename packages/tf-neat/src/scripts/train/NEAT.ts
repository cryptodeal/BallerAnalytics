import { tensor, concat, util } from '@tensorflow/tfjs-node';
import { loadNEATPlayers, type NeatPlayer } from '@balleranalytics/nba-api-ts';
import { Genome } from '../../../src/core/neat/Genome';
import { TFGenome } from '../../../src/core/neat/TFGenome';
import { Neat, type RandGenomeOpts } from '../../../src/core/neat';
import type { Tensor, Rank } from '@tensorflow/tfjs-node';

/* TODO: rewrite function to train NEAT model on draft */
const trainNeat = async (batchSize = 8) => {
	const players = (await loadNEATPlayers(2021)).filter(
		(p) =>
			p.labels[0] > 500 &&
			!p.inputs.filter((i) => Number.isNaN(i)).length &&
			!p.labels.filter((i) => Number.isNaN(i)).length
	);
	// players.map((p, i) => console.log(i + ':', p ? p.name : p));
	const playerCount = players.length;

	const evalFitness = (gen: Genome) => {
		/* select batch, size `batchSize`, unique random players */
		const testPlayers: NeatPlayer[] = players.slice(0, batchSize);
		/* batch predictions */
		const batchPreds: Tensor<Rank> = concat(
			testPlayers.map(
				(p) =>
					TFGenome.toTFGraph(
						gen,
						p.inputs.map((i) => [i])
					)[0]
			)
		);
		const batchLabels: Tensor<Rank> = concat(testPlayers.map(({ labels }) => tensor(labels)));

		const mse = (preds: Tensor<Rank>, labels: Tensor<Rank>) => preds.sub(labels).square().mean();
		const fitness = -mse(batchPreds, batchLabels).dataSync()[0];
		return fitness;
	};

	const randGenomeOpts: RandGenomeOpts = { input: 67, out: 1, maxHidden: 100, linkProb: 0.65 };

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
	while (bestFitness < -10) {
		util.shuffle(players);
		const { generation, highestFitness, species, connections, nodes } = neat.nextGeneration();
		if (highestFitness > bestFitness) bestFitness = highestFitness;
		console.log(
			`Generation: ${generation}; highestFitness: ${highestFitness}; species: ${species}; connections: ${connections}; nodes: ${nodes}`
		);
	}

	const genome = neat.fittestGenome as Genome;
	for (let i = 0; i < playerCount; i++) {
		const { inputs: tempInputs, labels } = players[i];

		const inputs = tempInputs.map((i) => [i]);

		const outputTensor = TFGenome.toTFGraph(genome, inputs)[0];

		const mse = (preds: Tensor<Rank>, labels: Tensor<Rank>) => preds.sub(labels).square().mean();
		const fitness = -mse(outputTensor, tensor(labels)).dataSync()[0];

		console.log(
			'prediction:',
			outputTensor.dataSync()[0],
			'actual:',
			labels[0],
			'fitness:',
			fitness
		);
	}
};

trainNeat();
