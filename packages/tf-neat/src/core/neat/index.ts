import { Species } from './Species';
import { Genome, type MutationRates } from './Genome';

export type ActivationOpts =
	| 'elu'
	| 'relu'
	| 'relu6'
	| 'selu'
	| 'softmax'
	| 'sigmoid'
	| 'softplus'
	| 'tanh';

export type MutateBoostOpts = {
	enabled?: boolean;
	maxMutateRate?: number;
	startThreshold?: number;
};

export type MutateBoostConfig = MutateBoostOpts & {
	enabled: boolean;
	maxMutateRate: number;
	startThreshold: number;
};

export type NeatConfig = {
	dropoff?: number;
	mutateBoost?: MutateBoostOpts;
	mutationRates?: MutationRates;
	activationFns?: ActivationOpts[];
	populationSize?: number;
};

export type RandGenomeOpts = {
	input: number;
	out: number;
	maxHidden: number;
	linkProb: number;
};

export class Neat {
	public dropoff?: number = undefined;
	private mutateBoost: MutateBoostConfig = {
		enabled: false,
		maxMutateRate: 0.75,
		startThreshold: 0.75
	};
	private compatibilityThreshold = 2;
	private tempSpecies: Species[] = [];
	public species: Species[] = [];
	private randGenome: RandGenomeOpts;
	public genomes: Genome[];
	public evaluator: (gen: Genome) => number;
	public fittestGenome: Genome | null = null;
	public highestFitness = -Infinity;
	public populationSize = 200;
	public generation = 0;
	public mutationRates!: MutationRates;

	constructor(
		genomeOpts: RandGenomeOpts,
		evaluator: (gen: Genome) => number,
		config: NeatConfig = {}
	) {
		this.randGenome = genomeOpts;
		const { dropoff, mutateBoost, populationSize, mutationRates } = config;
		if (dropoff) this.dropoff = dropoff;
		if (populationSize) this.populationSize = populationSize;
		if (mutationRates) this.mutationRates = mutationRates;

		if (mutateBoost) {
			const { enabled, maxMutateRate, startThreshold } = mutateBoost;
			if (enabled) this.mutateBoost.enabled = enabled;
			if (maxMutateRate) this.mutateBoost.maxMutateRate = maxMutateRate;
			if (startThreshold) this.mutateBoost.startThreshold = startThreshold;
		}
		const { input, out, maxHidden, linkProb } = genomeOpts;
		this.genomes = new Array(this.populationSize);
		for (let i = 0; i < this.populationSize; i++) {
			this.genomes[i] = Genome.newRandGenome(input, out, maxHidden, linkProb);
		}
		this.classifyPopulationIntoSpecies();

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
				/* if previous gen of species exists */
				if (this.tempSpecies.length) {
					let matchFound = false;
					/* check for species match in prev gen */
					for (const spe of this.tempSpecies) {
						if (genome.compatibilityDistance(spe.representative) < this.compatibilityThreshold) {
							matchFound = true;
							if (spe.isNotDropoff()) {
								const bestFitness = spe.getFittestGenome().fitness;
								const species = new Species(genome, spe.genWithoutProgress, bestFitness);
								if (this.mutateBoost) species.mutateBoost = this.mutateBoost;
								if (this.dropoff) species.dropoff = this.dropoff;
								this.species.push(species);
								break;
							}
							break;
						}
					}
					/* if no match found, create new species */
					if (!matchFound) {
						const species = new Species(genome);
						if (this.mutateBoost) species.mutateBoost = this.mutateBoost;
						if (this.dropoff) species.dropoff = this.dropoff;
						this.species.push(species);
					}
				} else {
					/* if no species in prev gen, create new species */
					const species = new Species(genome);
					if (this.mutateBoost) species.mutateBoost = this.mutateBoost;
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
		const tempSpecies = this.species.filter((s) => s.isNotDropoff());
		while (this.genomes.length < this.populationSize) {
			if (!tempSpecies.length) {
				const { input, out, maxHidden, linkProb } = this.randGenome;
				const gen1 = Genome.newRandGenome(input, out, maxHidden, linkProb);
				const gen2 = Genome.newRandGenome(input, out, maxHidden, linkProb);

				const child = gen1.fitness > gen2.fitness ? gen1.crossover(gen2) : gen2.crossover(gen1);
				child.mutate();

				this.genomes.push(child);
			} else {
				const randomSpecies = tempSpecies[Math.floor(Math.random() * tempSpecies.length)];
				const gen1 = randomSpecies.getRandomGenome();
				const gen2 = randomSpecies.getRandomGenome();

				const child = gen1.fitness > gen2.fitness ? gen1.crossover(gen2) : gen2.crossover(gen1);
				child.mutate();

				this.genomes.push(child);
			}
		}
	}

	private clearSpecies() {
		this.tempSpecies = this.species;
		this.species = [];
	}
}
