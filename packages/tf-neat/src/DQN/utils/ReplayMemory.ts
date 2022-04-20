import { util } from '@tensorflow/tfjs-node';

/** Replay buffer for DQN training. */
export class ReplayMemory {
	/* maxLen: Maximal buffer length */
	public maxLen: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public buffer: any[] = [];
	public index = 0;
	public length = 0;
	private bufferIndices: number[] = [];

	constructor(maxLen: number) {
		this.maxLen = maxLen;
		this.buffer = Array(maxLen).fill(null);
		this.bufferIndices = [...Array(maxLen).keys()];
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	append(item: any) {
		this.buffer[this.index] = item;
		this.length = Math.min(this.length + 1, this.maxLen);
		this.index = (this.index + 1) % this.maxLen;
	}

	/**
	 * Randomly sample a batch of items from the replay buffer.
	 * The sampling is done *without* replacement.
	 */
	sample(batchSize: number) {
		if (batchSize > this.maxLen) {
			throw new Error(`batchSize (${batchSize}) exceeds buffer length (${this.maxLen})`);
		}
		util.shuffle(this.bufferIndices);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const out: any[] = [];
		for (let i = 0; i < batchSize; ++i) {
			out.push(this.buffer[this.bufferIndices[i]]);
		}
		return out;
	}
}
