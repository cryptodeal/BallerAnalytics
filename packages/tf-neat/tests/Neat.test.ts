import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { tensor } from '@tensorflow/tfjs-node';
import { NodeGene } from '../src/core/neat/gene/Node';
import { Genome } from '../src/core/neat/Genome';
import { TFGenome } from '../src/core/neat/TFGenome';
import { Neat } from '../src/core/neat';
import { NodeType } from '../src/core/neat/gene';

const NEATTest = suite('NEATTest');

NEATTest('create 2 genomes w nodes and connections; compatibilityDistance()', () => {
	const t0 = performance.now();
	const gen1 = new Genome();
	gen1.addNode(new NodeGene(NodeType.INPUT, 0));
	gen1.addNode(new NodeGene(NodeType.INPUT, 1));
	gen1.addNode(new NodeGene(NodeType.INPUT, 2));
	gen1.addNode(new NodeGene(NodeType.HIDDEN, 4));
	gen1.addNode(new NodeGene(NodeType.OUTPUT, 3));
	gen1.addConnection(0, 3);
	gen1.addConnection(1, 3, false);
	gen1.addConnection(2, 3);
	gen1.addConnection(1, 4);
	gen1.addConnection(4, 3);
	gen1.addConnection(0, 4);

	const gen2 = new Genome();
	gen2.addNode(new NodeGene(NodeType.INPUT, 0));
	gen2.addNode(new NodeGene(NodeType.INPUT, 1));
	gen2.addNode(new NodeGene(NodeType.INPUT, 2));
	gen2.addNode(new NodeGene(NodeType.HIDDEN, 4));
	gen2.addNode(new NodeGene(NodeType.HIDDEN, 5));
	gen2.addNode(new NodeGene(NodeType.OUTPUT, 3));
	gen2.addConnection(0, 3);
	gen2.addConnection(1, 3, false);
	gen2.addConnection(2, 3);
	gen2.addConnection(1, 4);
	gen2.addConnection(4, 3, false);
	gen2.addConnection(4, 5);
	gen2.addConnection(5, 3);
	gen2.addConnection(2, 4);
	gen2.addConnection(0, 5);

	const compatDistance = gen2.compatibilityDistance(gen1);
	console.log('Compatibility distance:', compatDistance);
	assert.type(compatDistance, 'number');

	const t1 = performance.now();
	console.log('Took ' + (t1 - t0) + ' milliseconds.');
});

NEATTest('create 2 genomes w nodes and connections; compatibilityDistance()', () => {
	const t0 = performance.now();
	const startGen = new Genome();
	startGen.addNode(new NodeGene(NodeType.INPUT, 0));
	startGen.addNode(new NodeGene(NodeType.INPUT, 1));
	startGen.addNode(new NodeGene(NodeType.HIDDEN, 2));
	startGen.addNode(new NodeGene(NodeType.OUTPUT, 3));
	startGen.addConnection(0, 2);
	startGen.addConnection(1, 2);
	startGen.addConnection(2, 3);

	const neat = new Neat(startGen, (gen: Genome) => {
		const inputs = [
			[0, 1, 0, 1],
			[0, 0, 1, 1]
		];
		const labels = [0, 1, 1, 0];

		const outputTensor = TFGenome.toTFGraph(gen, inputs)[0];

		const mse = (preds, labels) => preds.sub(labels).square().mean();
		const fitness = -mse(outputTensor, tensor(labels)).dataSync()[0];

		return fitness;
	});

	for (let i = 0; i < 1000; i++) {
		const { generation, highestFitness, species, connections, nodes } = neat.nextGeneration();
		console.log(
			`Generation: ${generation}; highestFitness: ${highestFitness}; species: ${species}; connections: ${connections}; nodes: ${nodes}`
		);
		assert.type(generation, 'number');
		assert.equal(generation, i + 1);
		assert.type(highestFitness, 'number');
		assert.type(species, 'number');
		assert.type(connections, 'number');
		assert.type(nodes, 'number');
	}

	const t1 = performance.now();
	console.log('Took ' + (t1 - t0) + ' milliseconds.');
});

NEATTest.run();
