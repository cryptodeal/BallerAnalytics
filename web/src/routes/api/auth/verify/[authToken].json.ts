import crypto from 'crypto';
import { User } from '@balleranalytics/nba-api-ts';
import createToken from '$lib/functions/_api/auth/createToken';
import decodeToken from '$lib/functions/_api/auth/decodeToken';
import type { RequestHandler } from '@sveltejs/kit';
import type { JWTPayload } from '$lib/types';

type VerifyTokenParams = {
	authToken: string;
};

export const get: RequestHandler<VerifyTokenParams> = async (event) => {
	const { authToken } = event.params;

	const hashedToken = crypto.createHash('sha256').update(authToken).digest('hex');

	const user = await User.findOne({
		authLoginToken: hashedToken,
		authLoginExpires: { $gt: new Date() }
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

	const decoded = decodeToken(tokenPayload);
	if (decoded == null) throw Error(`Error: could not decode token`);
	event.locals.user = decoded.payload as JWTPayload;
	//let cookie1 = `cookie1Test=testCookie1; Path=/; HttpOnly`
	//let cookie2 = `cookie2Test=testCookie2; Path=/; HttpOnly`

	if (accessToken) {
		return {
			status: 200,
			headers: {
				'set-cookie': [accessToken, refreshToken]
			}
		};
	}
};
