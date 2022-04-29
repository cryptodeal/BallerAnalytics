import type { DQNPlayer } from '@balleranalytics/nba-api-ts';
export type TaskState = Record<string, number[][]>;

export type TeamOpts = {
	pg: number;
	sg: number;
	sf: number;
	pf: number;
	f: number;
	c: number;
	g: number;
	util: number;
	be: number;
};

export type TaskParams = {
	dimensions: [number, number, number];
	all_actions: number[];
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

export type PositionEnum = 'pg' | 'sg' | 'sf' | 'pf' | 'c' | 'g' | 'f' | 'util' | 'be';
export type DQNRoster = Record<PositionEnum, DQNPlayer[]>;
