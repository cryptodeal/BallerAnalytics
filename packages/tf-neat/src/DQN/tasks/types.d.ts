export type TaskState = {
	s: number[][];
	e: number[][];
};

export type TeamOpts = {
	pg: number;
	sg: number;
	sf: number;
	pf: number;
	c: number;
	g: number;
	util: number;
	be: number;
};

export type TaskParams = {
	all_actions: number[];
	numPlayers: number;
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
