export const colors: Record<string, string> = {
	RED: '#FF0000',
	GREEN: '#00FF00',
	LIGHTBLUE: '#00BCF2',
	BLUE: '#0000FF',
	PURPLE: '#7027C3',
	YELLOW: '#FFFF00',
	GREY: '#646464'
};

export const object_to_idx: Record<string, number> = {
	unseen: 0,
	empty: 1,
	wall: 2,
	floor: 3,
	door: 4,
	key: 5,
	ball: 6,
	box: 7,
	goal: 8,
	lava: 9,
	agent: 10,
	mark: 11
};

export const action_to_idx: Record<string, number> = {
	right: 0,
	down: 1,
	left: 2,
	up: 3
};

export const dirs = [
	[1, 0],
	[0, 1],
	[-1, 0],
	[0, -1]
]; // E-S-W-N
export const dirs_tri = [
	[
		[1, 0],
		[1, 1]
	],
	[
		[1, 1],
		[0, 1]
	],
	[
		[0, 1],
		[0, 0]
	],
	[
		[0, 0],
		[1, 0]
	]
]; // E-S-W-N

export const grid_prob: Record<string, number[]> = {
	early: [6, 6, 6, 6, 6, 6, 7, 7, 7, 8],
	middle: [6, 6, 6, 7, 7, 7, 7, 7, 8, 8],
	late: [6, 7, 7, 7, 8, 8, 8, 8, 8, 8]
};

export const initFiles = `rm -f A3C_Data/*.txt
mkdir -p A3C_Data
mkdir -p A3C_Data/temporary-global-model-actor
mkdir -p A3C_Data/temporary-global-model-critic
mkdir -p A3C_Data/global-model-actor
mkdir -p A3C_Data/global-model-critic
cd A3C_Data
touch queue.txt global_moving_average.txt best_score.txt global_episode.txt workers_tokens.txt
echo 0 > global_moving_average.txt
echo 0 > global_episode.txt
echo 0 > best_score.txt`;
