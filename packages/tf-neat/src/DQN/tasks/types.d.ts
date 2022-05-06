import type { DQNPlayer, DQNPlayerLean } from '@balleranalytics/nba-api-ts';
export type TaskState = Record<string, number[][]>;

export type PositionEnum = 'pg' | 'sg' | 'sf' | 'pf' | 'c' | 'g' | 'f' | 'util' | 'be';
export type TeamOpts = Record<string, number>;

export type TaskParams = {
	dimensions: [number, number, number];
	all_actions: DQNPlayer[];
	teamOpts: TeamOpts;
};

export type DraftTaskParams = TaskParams & {
	oppCount: number;
	teamOpts: TeamOpts;
};

export type PlayStepOutput = {
	action: number;
	cumulativeReward: number;
	done: boolean;
	milestone: number;
};

type TaskRewardVal = number;
type TaskActionVal = number;
type TaskStateVal = undefined | TaskState;
type TaskDoneVal = boolean;

export type TaskStepOutput = {
	reward: number;
	state?: TaskState;
	milestone: boolean;
	done: boolean;
};

export type ReplayMemoryAppend = [
	TaskState,
	TaskActionVal,
	TaskRewardVal,
	TaskDoneVal,
	TaskStateVal
];

export type DQNRoster = Record<string, (DQNPlayerLean | null)[]>;

export type DQNRosterLean = Record<string, (string | null)[]>;
