import { loadIncompleteGames } from '$lib/_db/controllers/game2';

export async function get() {
	const games = await loadIncompleteGames();

	if (games) {
		return {
			body: {
				games
			}
		};
	}

	return {
		status: 500
	};
}
