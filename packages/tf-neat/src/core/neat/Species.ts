import { seededRandom } from '../../utils';
import type { Genome } from './Genome';

export class Species {
	private dropoffRate = 15;
	public prevHighFitness = -Infinity;
	public representative: Genome;
	public genomes: Genome[];
	public genWithoutProgress = 0;

	constructor(representative: Genome, genWithoutProgress = 0, prevHighFitness?: number) {
		if (prevHighFitness) this.prevHighFitness = prevHighFitness;
		this.genWithoutProgress = genWithoutProgress;
		this.representative = representative;
		this.genomes = [representative];
	}

	getRandomGenome() {
		return this.genomes[Math.floor(seededRandom() * this.genomes.length)];
	}

	getFittestGenome() {
		return this.genomes.reduce((gen1, gen2) => (gen1.fitness > gen2.fitness ? gen1 : gen2));
	}

	adjustFitness() {
		this.representative.fitness /= this.size();
		this.genomes.forEach((gen) => {
			gen.fitness /= this.size();
		});
		if (this.getFittestGenome().fitness <= this.prevHighFitness) this.genWithoutProgress++;
	}

	add(genome: Genome) {
		this.genomes.push(genome);
	}

	size() {
		return this.genomes.length;
	}

	clear() {
		this.genomes = [];
	}

	isDropoff() {
		return this.genWithoutProgress >= this.dropoff;
	}

	get dropoff() {
		return this.dropoffRate;
	}

	set dropoff(value: number) {
		this.dropoffRate = value;
	}
}
