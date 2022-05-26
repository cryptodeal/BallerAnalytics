import { seededRandom } from '../../utils';
import type { Genome } from './Genome';
import type { MutateBoostConfig } from '.';

export class Species {
	public dropoff: undefined | number = undefined;
	public mutateBoost: MutateBoostConfig = {
		enabled: false,
		maxMutateRate: 0.75,
		startThreshold: 0.75
	};
	public mutateBoostThreshold!: number;
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
		const bestFitness = this.getFittestGenome().fitness;
		if (bestFitness <= this.prevHighFitness) {
			this.genWithoutProgress++;
		} else {
			this.genWithoutProgress = 0;
		}
	}

	boostMutateRate(r: number, boost: number) {
		return r + boost * (this.genWithoutProgress + 1 - this.mutateBoostThreshold);
	}

	useMutateBoost() {
		return (
			this.mutateBoost.enabled &&
			this.dropoff &&
			this.genWithoutProgress / this.dropoff >= this.mutateBoost.startThreshold
		);
	}

	add(genome: Genome) {
		/**
		 * if dropoff && mutateBoost enabled, increase mutationRates at
		 * regular interval from initVal to `maxMutateRate` when greater than
		 * or equal to `startThreshold` until reaching dropoff age;
		 * simulates increasing evolutionary pressure
		 */
		if (this.useMutateBoost()) {
			this.mutateBoostThreshold = this.genWithoutProgress;
			const mutateRates = genome.getMutationRate();
			for (const [key, value] of Object.entries(mutateRates)) {
				mutateRates[key] = this.boostMutateRate(
					value,
					(this.mutateBoost.maxMutateRate - value) /
						((this.dropoff as number) - this.genWithoutProgress)
				);
			}
			genome.setMutateBoostRate(mutateRates);
			genome.mutateBoost = true;
		}
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
