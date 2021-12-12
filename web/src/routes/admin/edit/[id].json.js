import { loadGameData, updateGameData } from '$lib/_db/controllers/game2';

export async function get({ params }) {
	const { id } = params;
	const gameData = await loadGameData(id);

	if (gameData) {
		return {
			body: {
				gameData
			}
		};
	}

	return {
		status: 500
	};
}

export async function post({ params, body }) {
	const { id } = params;
	/*TODO: Auth Cookies */
	if (body) {
		const { updates } = body;
		return updateGameData(id, updates)
			.then(() => {
				//console.log(r)
				return {
					body: {
						success: true
					},
					status: 200
				};
			})
			.catch((error) => {
				return {
					error,
					status: 500
				};
			});
	}

	return {
		status: 500
	};
}
