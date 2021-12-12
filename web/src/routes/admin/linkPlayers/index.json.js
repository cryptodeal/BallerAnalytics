import { findMatchingPlayers, addNbaId } from '$lib/_db/controllers/player2';
//import {addBballRefId} from '$lib/_db/controllers/player'

export async function get() {
	return findMatchingPlayers()
		.then((playerData) => {
			return {
				status: 200,
				body: {
					playerData
				}
			};
		})
		.catch((err) => {
			console.trace(err);
			return {
				status: 500,
				body: {
					err
				}
			};
		});
}

export async function post({ /*headers,*/ body }) {
	/*TODO: Auth Cookies */
	if (body) {
		const { nbaId, id } = body;
		//return Promise.all([addNbaId(id, nbaId), addBballRefId(nbaId, id)])
		return addNbaId(id, nbaId)
			.then((data) => {
				return {
					body: {
						success: true,
						data
					},
					status: 200
				};
			})
			.catch((error) => {
				return {
					body: {
						error
					},
					status: 500
				};
			});
	}

	return {
		status: 500
	};
}
