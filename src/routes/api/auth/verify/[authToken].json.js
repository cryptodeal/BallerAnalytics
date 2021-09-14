import crypto from 'crypto';
import { User } from '$lib/_db/models';
import createToken from '$lib/_api/auth/createToken';
import decodeToken from '$lib/_api/auth/decodeToken';
/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get(request) {
	//console.log(request);
	const { authToken } = request.params;

	const hashedToken = crypto.createHash('sha256').update(authToken).digest('hex');

	const user = await User.findOne({
		authLoginToken: hashedToken,
		authLoginExpires: { $gt: Date.now() }
	});

	if (!user) {
		return {
			status: 400,
			body: {
				error: 'Invalid authToken; Please try logging in again'
			}
		};
	}
	// If the user exists and token isn't expired, remove token and send JWT token
	user.authLoginToken = undefined;
	user.authLoginExpires = undefined;
	await user.save();

	// Log the user in and send JWT
	const { accessToken, refreshToken, tokenPayload } = await createToken(user);
	const { payload } = await decodeToken(tokenPayload);
	request.locals.user = payload;

	if (accessToken && refreshToken) {
		return {
			headers: {
				'set-cookie': [accessToken, refreshToken]
			}
		};
	}
}
