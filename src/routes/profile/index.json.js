import { findUserById } from "$lib/_db/controllers/user";

export async function get({ query }) {
	const userId = query.get('userId');
  console.log(userId);
	const userData = await findUserById(userId);
  console.log(userData);

	if (userData) {
		return {
			body: {
				userData
			}
		};
	}

	return {
		status: 500
	};
}