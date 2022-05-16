import { Species } from './Species';
import type { Genome } from './Genome';

export type NeatConfig = {
	dropoff?: number;
	mutationRates?: {
		activation?: number;
		connection?: number;
		bias?: number;
	};
};

export class Neat {
	public dropoff?: number = undefined;
	private compatibilityThreshold = 2;
	private tempSpecies: Species[] = [];
	public species: Species[] = [];
	public genomes: Genome[];
	public evaluator: (gen: Genome) => number;
	public fittestGenome: Genome | null = null;
	public highestFitness = -Infinity;
	public populationSize = 50;
	public generation = 0;

	constructor(genome: Genome, evaluator: (gen: Genome) => number, dropoff?: number) {
		if (dropoff) this.dropoff = dropoff;
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
		for (const genome of this.genomes) {
			let foundSpecies = false;
			for (const spe of this.species) {
				if (genome.compatibilityDistance(spe.representative) < this.compatibilityThreshold) {
					spe.add(genome);
					foundSpecies = true;
					break;
				}
			}

			if (!foundSpecies) {
				if (this.tempSpecies.length) {
					let matchFound = false;
					/* check for species match in prev gen */
					for (const spe of this.tempSpecies) {
						if (genome.compatibilityDistance(spe.representative) < this.compatibilityThreshold) {
							const bestFitness = spe.getFittestGenome().fitness;
							const species = new Species(genome, spe.genWithoutProgress, bestFitness);
							if (this.dropoff) species.dropoff = this.dropoff;
							this.species.push(species);
							matchFound = true;
							break;
						}
					}
					/* if no match found, create new species */
					if (!matchFound) {
						const species = new Species(genome);
						if (this.dropoff) species.dropoff = this.dropoff;
						this.species.push(species);
					}
				} else {
					/* if no species in prev gen, create new species */
					const species = new Species(genome);
					if (this.dropoff) species.dropoff = this.dropoff;
					this.species.push(species);
				}
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

		for (const spe of this.species.filter((s) => s.isNotDropoff())) {
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
		this.tempSpecies = this.species.slice();
		this.species = [];
	}
}
