import { tensor } from '@tensorflow/tfjs-node';
import { loadDQNPlayers } from '@balleranalytics/nba-api-ts';
import { NodeGene } from '../../../src/core/neat/gene/Node';
import { Genome } from '../../../src/core/neat/Genome';
import { TFGenome } from '../../../src/core/neat/TFGenome';
import { Neat } from '../../../src/core/neat';
import { NodeType } from '../../../src/core/neat/gene';
import { getRandomInt } from '../../DQN/utils';

import type { TeamOpts } from '../../DQN/tasks/types';
import type { Tensor, Rank } from '@tensorflow/tfjs-node';
/* TODO: write function to train NEAT model on draft */
const trainNeat = async () => {
	const teamOpts: TeamOpts = { pg: 1, sg: 1, sf: 1, pf: 1, f: 1, c: 1, g: 1, util: 3, be: 3 };
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
	for (let i = 0; i < 5; i++) {
		initGenome.addNode(new NodeGene(NodeType.HIDDEN, nodeCount));
		nodeCount++;
	}

	const outputNode = nodeCount;
	initGenome.addNode(new NodeGene(NodeType.OUTPUT, nodeCount));

	const lastHiddenNode = outputNode - 1;

	for (let i = 0; i < 75; i++) {
		for (let j = firstHiddenNode; j <= lastHiddenNode; j++) {
			initGenome.addConnection(i, j);
		}
	}

	for (let i = firstHiddenNode; i <= lastHiddenNode; i++) {
		initGenome.addConnection(i, outputNode);
	}

	const neat = new Neat(initGenome, (gen: Genome) => {
		const { inputs: tempInputs, labels } = players[getRandomInt(0, players.length)];

		const inputs = tempInputs.map((i) => [i]);

		const outputTensor = TFGenome.toTFGraph(gen, inputs)[0];

		const mse = (preds: Tensor<Rank>, labels: Tensor<Rank>) => preds.sub(labels).square().mean();
		const fitness = -mse(outputTensor, tensor(labels)).dataSync()[0];
		/*
        console.log(
          'prediction:',
          outputTensor.dataSync()[0],
          'actual:',
          labels[0],
          'fitness:',
          fitness
        );
      */

		return fitness;
	});

	let bestFitness = -Infinity;
	while (bestFitness < -0.0001) {
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
