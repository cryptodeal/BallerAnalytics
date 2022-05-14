import { Species } from './Species';
import type { Genome } from './Genome';

export class Neat {
	public species: Species[] = [];
	public genomes: Genome[];
	public evaluator: (gen: Genome) => number;
	public fittestGenome: Genome | null = null;
	public highestFitness = -Infinity;
	public populationSize = 50;
	public generation = 0;

	constructor(genome: Genome, evaluator: (gen: Genome) => number) {
		this.genomes = [genome];
		this.evaluator = evaluator;
	}

	nextGeneration() {
		this.clearSpecies();

		this.classifyPopulationIntoSpecies();
		this.evaluateGenomes();
		this.keepBestGenomes();
		this.crossOverAndMutate();

		this.generation++;

		return {
			generation: this.generation,
			highestFitness: this.highestFitness,
			species: this.species.length,
			connections: this.fittestGenome?.cxns.size,
			nodes: this.fittestGenome?.nodes.size
		};
	}

	private classifyPopulationIntoSpecies() {
		const compatibilityThreshold = 2;

		for (const genome of this.genomes) {
			let foundSpecies = false;
			for (const spe of this.species) {
				if (genome.compatibilityDistance(spe.representative) < compatibilityThreshold) {
					spe.add(genome);
					foundSpecies = true;
					break;
				}
			}

			if (!foundSpecies) {
				this.species.push(new Species(genome));
			}
		}

		/* remove empty Species and change representative */
		for (let i = 0; i < this.species.length; i++) {
			const spe = this.species[i];
			if (spe.size() === 0) {
				this.species.splice(i, 1);
				i--;
				console.log('Removed empty species');
			}
		}
	}

	private evaluateGenomes() {
		this.genomes.forEach((gen) => {
			gen.fitness = this.evaluator(gen);
			if (gen.fitness > this.highestFitness) {
				this.fittestGenome = gen;
				this.highestFitness = gen.fitness;
			}
		});

		this.species.forEach((spe) => {
			spe.adjustFitness();
		});
	}

	private keepBestGenomes() {
		this.genomes = [];

		for (const spe of this.species) {
			this.genomes.push(spe.getFittestGenome());
		}
	}

	private crossOverAndMutate() {
		while (this.genomes.length < this.populationSize) {
			const randomSpecies = this.species[Math.floor(Math.random() * this.species.length)];
			const gen1 = randomSpecies.getRandomGenome();
			const gen2 = randomSpecies.getRandomGenome();

			const child = gen1.fitness > gen2.fitness ? gen1.crossover(gen2) : gen2.crossover(gen1);
			child.mutate();

			this.genomes.push(child);
		}
	}

	private clearSpecies() {
		this.species = [];
	}
}
