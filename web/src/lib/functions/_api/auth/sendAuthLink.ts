import { User } from '@balleranalytics/nba-api-ts';
import Email from '$lib/functions/_api/auth/email';
import type UAParser from 'ua-parser-js';

const sendAuthLink = async (
	email: string,
	ua: UAParser.IResult,
	time: string,
	host: string
): Promise<boolean> => {
	// Get user from body.email
	let user = await User.findOne({ email: email });

	if (!user) {
		user = await User.create({
			email: email
		});
	}

	// Generate random auth token
	const authToken = user.createAuthToken();
	await user.save({ validateBeforeSave: false });

	const authLink = `http://${host}/api/auth/verify/${authToken}`;

	try {
		await new Email(user, authLink, ua.browser.name, ua.os.name, time).sendMagicLink();
		return true;
	} catch (err) {
		user.authLoginToken = undefined;
		user.authLoginExpires = undefined;
		await user.save({ validateBeforeSave: false });
		return false;
	}
};

export default sendAuthLink;
