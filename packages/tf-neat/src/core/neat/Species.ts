import { seededRandom } from '../../utils';
import type { Genome } from './Genome';

export class Species {
	public dropoff: undefined | number = undefined;
	public prevHighFitness = -Infinity;
	public representative: Genome;
	public genomes: Genome[];
	public genWithoutProgress: number;

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

	isNotDropoff() {
		if (!this.dropoff) return true;
		return this.genWithoutProgress < this.dropoff ? true : false;
	}
}
