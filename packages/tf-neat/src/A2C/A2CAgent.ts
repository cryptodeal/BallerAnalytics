import {
	sequential,
	layers,
	train,
	losses,
	oneHot,
	Tensor,
	Rank,
	tensor
} from '@tensorflow/tfjs-node';
import type { Sequential } from '@tensorflow/tfjs-node';
import { weightedRandomItem } from '../utils';
// import { serialize } from './utils';

const zeros = (w: number, h: number, v = 0): number[][] =>
	Array.from(new Array(h), () => Array(w).fill(v));

export class A2CAgent {
	public render: boolean;
	public state_size: number;
	public action_size: number;
	public value_size: number;

	public discount_factor: number;
	public actor_learningr: number;
	public critic_learningr: number;
	public actor: Sequential;
	public critic: Sequential;

	constructor(stateSize: number, actionSize: number) {
		this.render = false;
		this.state_size = stateSize;
		this.action_size = actionSize;
		this.value_size = 1;

		this.discount_factor = 0.99;
		this.actor_learningr = 0.001;
		this.critic_learningr = 0.005;

		this.actor = this.build_actor();
		this.critic = this.build_critic();
	}

	public build_actor() {
		const model = sequential();

		model.add(
			layers.dense({
				units: 24,
				activation: 'relu',
				kernelInitializer: 'glorotUniform',
				inputShape: [9, 12] //oneHotShape
			})
		);

		model.add(layers.flatten());

		model.add(
			layers.dense({
				units: this.action_size,
				activation: 'softmax',
				kernelInitializer: 'glorotUniform'
			})
		);

		model.summary();

		model.compile({
			optimizer: train.adam(this.actor_learningr),
			loss: losses.softmaxCrossEntropy
		});

		return model;
	}

	public build_critic() {
		const model = sequential();

		model.add(
			layers.dense({
				units: 24,
				activation: 'relu',
				kernelInitializer: 'glorotUniform',
				inputShape: [9, 12] //oneHot shape
			})
		);

		model.add(layers.flatten());

		model.add(
			layers.dense({
				units: this.value_size,
				activation: 'linear',
				kernelInitializer: 'glorotUniform'
			})
		);

		model.summary();

		model.compile({
			optimizer: train.adam(this.critic_learningr),
			loss: losses.meanSquaredError
		});

		return model;
	}

	/* going to want to validate that this works as expected lol */
	public fmtState(state: (number[] | number)[]) {
		const copy = state.slice();
		const length = state.length;
		for (let i = 0; i < length; i++) {
			if (Array.isArray(copy[i])) {
				copy[i] = Math.ceil(state[i][1] / 10);
			}
		}
		return copy;
	}

	public getAction(state: (number[] | number)[], actions: number[]) {
		const oneHotState = oneHot(this.fmtState(state), 12);

		const policy = <Tensor<Rank>>this.actor.predict(oneHotState.reshape([1, 9, 12]), {
			batchSize: 1
		});

		const policy_flat = policy.dataSync();

		return weightedRandomItem(actions, policy_flat);
	}

	public trainModel(
		state: (number[] | number)[],
		action: number,
		reward: number,
		next_state: (number[] | number)[],
		done: boolean
	) {
		const target: (number[] | number)[] = zeros(1, this.value_size);
		const advantages = zeros(1, this.action_size);

		let oneHotState = oneHot(this.fmtState(state), 12);
		let oneHotNextState = oneHot(this.fmtState(next_state), 12);
		oneHotState = oneHotState.reshape([1, 9, 12]);
		oneHotNextState = oneHotNextState.reshape([1, 9, 12]);
		const value = (<Tensor<Rank>>this.critic.predict(oneHotState)).flatten().dataSync()[0];
		const next_value = (<Tensor<Rank>>this.critic.predict(oneHotNextState)).flatten().dataSync()[0];

		if (done) {
			advantages[action] = [reward - value];
			target[0] = reward;
		} else {
			advantages[action] = [reward + this.discount_factor * next_value - value];
			target[0] = reward + this.discount_factor * next_value; //chgt + a -
		}

		this.actor.fit(oneHotState, tensor(advantages).reshape([1, 2047]), {
			epochs: 1
		});

		this.critic.fit(oneHotState, tensor(target), {
			epochs: 1
		});
	}

	/*
    public async mainA2C(offline = false) {
      const episode_done = false;

      if (!offline) {
        await environment.init_env();
      }
      let data = environment.getEnvironmentData();
      const AMOUNT_ACTIONS = data.actions_index.length;

      const STATE_SIZE = 12;
      const agent = new A2CAgent(STATE_SIZE, AMOUNT_ACTIONS);

      const reward_plotting = {};
      let episode_length = 0;
      // TODO: utilize draft API from DQN 
      for (let i = 0; i < dummyVarReplace; i++) {
        episode_done = false;
        reward_plotting[i] = [];
        const state = environment.reset();

        while (true) {
          data = environment.getEnvironmentData();
          console.log(
            'Episode ' + i + ' : ' + (data.current_step + 1) + '/' + (data.length_episode + 1)
          );

          const action = agent.getAction(state, data.actions_index);
          const step_data = await environment.step(action);
          const next_state = step_data.state,
            reward = step_data.reward,
            done = step_data.done;

          episode_length = step_data.episode_length;

          reward_plotting[i] += reward < 0 ? 1 : 0;
          agent.trainModel(state, action, reward, next_state, done);

          if (done) {
            break;
          }

          state = next_state;
        }
        reward_plotting[i] = (reward_plotting[i] / (episode_length + 1)) * 100;
        await serialize(
          {
            reward_plotting: reward_plotting
          },
          'plot_actor_critic.json'
        );
        if (i % 10) {
          agent.actor.save('file://./actor_model');
          agent.critic.save('file://./critic_model');
        }
      }
      return Promise.resolve({
        reward_plotting: reward_plotting
      });
    }
  */
}
