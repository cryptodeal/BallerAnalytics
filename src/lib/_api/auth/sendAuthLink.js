import { User } from '$lib/_db/models';
import Email from '$lib/_api/auth/email';

const sendAuthLink = async (email, ua, time, host) => {
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
		console.log(err);
		user.authLoginToken = undefined;
		user.authLoginExpires = undefined;
		await user.save({ validateBeforeSave: false });
		return err;
	}
};

export default sendAuthLink;
