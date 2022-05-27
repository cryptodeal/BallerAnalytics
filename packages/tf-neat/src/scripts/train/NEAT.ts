import { tensor, concat, util } from '@tensorflow/tfjs-node';
import { loadDQNPlayers, type DQNPlayer } from '@balleranalytics/nba-api-ts';
import { Genome } from '../../../src/core/neat/Genome';
import { TFGenome } from '../../../src/core/neat/TFGenome';
import { Neat, type RandGenomeOpts } from '../../../src/core/neat';
import { getRandomInt } from '../../DQN/utils';

import type { Tensor, Rank } from '@tensorflow/tfjs-node';
/* TODO: write function to train NEAT model on draft */
const trainNeat = async () => {
	const players = (await loadDQNPlayers(2021, 128)).filter(
		(p) => p.labels[0] > 500 && !p.inputs.filter((i) => Number.isNaN(i)).length
	);
	const playerCount = players.length;

	const evalFitness = (gen: Genome) => {
		util.shuffle(players);
		const testPlayers: DQNPlayer[] = [];

		/* select 4 unique random players */
		while (testPlayers.length < 3) {
			const player = players[getRandomInt(0, players.length)];
			if (!testPlayers.find((p) => p.isIdMatch(player.getId()))) {
				testPlayers.push(player);
			}
		}

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

	const randGenomeOpts: RandGenomeOpts = { input: 75, out: 1, maxHidden: 15, linkProb: 0.75 };

	const neat = new Neat(randGenomeOpts, evalFitness, {
		dropoff: 25,
		mutateBoost: {
			enabled: true,
			startThreshold: 0.5,
			maxMutateRate: 0.6
		},
		populationSize: 256
	});

	let bestFitness = -Infinity;
	while (bestFitness < -10) {
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
