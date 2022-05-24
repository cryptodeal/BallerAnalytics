import { tensor, concat } from '@tensorflow/tfjs-node';
import { loadDQNPlayers, type DQNPlayer } from '@balleranalytics/nba-api-ts';
import { NodeGene } from '../../../src/core/neat/gene/Node';
import { Genome } from '../../../src/core/neat/Genome';
import { TFGenome } from '../../../src/core/neat/TFGenome';
import { Neat } from '../../../src/core/neat';
import { NodeType } from '../../../src/core/neat/gene';
import { getRandomInt } from '../../DQN/utils';

import type { Tensor, Rank } from '@tensorflow/tfjs-node';
/* TODO: write function to train NEAT model on draft */
const trainNeat = async () => {
	const players = (await loadDQNPlayers(2021, 250)).filter(
		(p) => p.labels[0] > 500 && !p.inputs.filter((i) => Number.isNaN(i)).length
	);
	const playerCount = players.length;
	let nodeCount = 0;

	const initGenome = new Genome();
	for (let i = 0; i < 75; i++) {
		initGenome.addNode(new NodeGene(NodeType.INPUT, nodeCount));
		nodeCount++;
	}

	/* 1st hidden layer */
	const firstHiddenNode = nodeCount;
	for (let i = 0; i < 2; i++) {
		initGenome.addNode(new NodeGene(NodeType.HIDDEN, nodeCount));
		nodeCount++;
	}
	const firstHiddenEnd = nodeCount - 1;

	/* 2nd hidden layer 
	const secondHiddenStart = nodeCount;
	for (let i = 0; i < 2; i++) {
		initGenome.addNode(new NodeGene(NodeType.HIDDEN, nodeCount));
		nodeCount++;
	}
  */
	const outputNode = nodeCount;
	initGenome.addNode(new NodeGene(NodeType.OUTPUT, nodeCount));

	// const secondHiddenEnd = outputNode - 1;

	for (let i = 0; i < 75; i++) {
		for (let j = firstHiddenNode; j <= firstHiddenEnd; j++) {
			initGenome.addConnection(i, j);
		}
	}

	/*
  for (let i = firstHiddenNode; i < firstHiddenEnd; i++) {
		for (let j = secondHiddenStart; j <= secondHiddenEnd; j++) {
			initGenome.addConnection(i, j);
		}
	}
  */

	for (let i = firstHiddenNode; i <= firstHiddenEnd; i++) {
		initGenome.addConnection(i, outputNode);
	}

	const evalFitness = (gen: Genome) => {
		const testPlayers: DQNPlayer[] = [];

		/* select 8 unique random players */
		while (testPlayers.length < 7) {
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
		/*
      console.log(
        'prediction:',
        outputTensor.dataSync()[0],
        'batchLabels:',
        batchLabels,
        'fitness:',
        fitness
      );
    */
		return fitness;
	};

	const neat = new Neat(initGenome, evalFitness, {
		dropoff: 15,
		mutateBoost: {
			enabled: true,
			startThreshold: 0.5
		},
		populationSize: 128
	});

	let bestFitness = -Infinity;
	while (bestFitness < -0.01) {
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
